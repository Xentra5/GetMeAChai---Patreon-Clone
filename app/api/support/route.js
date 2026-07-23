import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import Payment from "@/models/Payment";
import User from "@/models/user";
import WalletTransaction from "@/models/WalletTransaction";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator");

    if (!creator) {
      return NextResponse.json({ error: "Creator username is required" }, { status: 400 });
    }

    await connectDB();

    const creatorSlug = creator.toLowerCase().replace(/\s+/g, "");
    const session = await getServerSession(authOptions);

    let isOwner = false;
    let userCumulativeAmount = 0;

    if (session?.user?.email) {
      const loggedUserEmail = session.user.email.toLowerCase();

      // Check if logged-in user is the creator owner
      const creatorUser = await User.findOne({ email: loggedUserEmail });
      if (creatorUser) {
        const creatorUserSlug = (creatorUser.name || creatorUser.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
        if (creatorUserSlug === creatorSlug) {
          isOwner = true;
        }
      }

      // Calculate total donation support
      const userPayments = await Payment.find({
        from_email: loggedUserEmail,
        to_username: creatorSlug,
        status: "success",
      });
      userCumulativeAmount = userPayments.reduce((acc, pay) => acc + pay.amount, 0);
    }

    const payments = await Payment.find({
      to_username: creatorSlug,
      status: "success",
    })
      .sort({ createdAt: -1 })
      .lean();

    const fromEmails = [...new Set(payments.map(p => p.from_email).filter(Boolean))];
    const users = await User.find({ email: { $in: fromEmails } }, { email: 1, avatarUrl: 1 });
    const userMap = new Map(users.map(u => [u.email.toLowerCase(), u.avatarUrl]));

    const isMember = isOwner || userCumulativeAmount >= 100;

    const processedPayments = payments.map((pay) => {
      const supporterAvatar = pay.from_email ? userMap.get(pay.from_email.toLowerCase()) : null;
      const basePay = {
        ...pay,
        avatarUrl: supporterAvatar || "https://i.pravatar.cc/100?img=11",
      };
      if (isMember) {
        return basePay;
      }
      return {
        ...basePay,
        name: "Supporter",
        message: "🔒 Locked. Support this creator to unlock the message feed!",
      };
    });

    const totalSupportSum = payments.reduce((acc, pay) => acc + pay.amount, 0);

    return NextResponse.json({
      payments: processedPayments,
      isMember,
      totalSupportSum,
    });
  } catch (error) {
    console.error("Error fetching support payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Please sign in to support creators." }, { status: 401 });
    }

    const { name, to_username, amount, message } = await request.json();

    if (!to_username || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const creatorSlug = to_username.toLowerCase().replace(/\s+/g, "");
    const loggedUserEmail = session.user.email.toLowerCase();

    // Find the logged-in user (supporter)
    const loggedUser = await User.findOne({ email: loggedUserEmail });
    if (!loggedUser) {
      return NextResponse.json({ error: "Supporter profile not found" }, { status: 404 });
    }

    const supportAmount = Number(amount);
    if (loggedUser.walletBalance < supportAmount) {
      return NextResponse.json({
        error: `Insufficient wallet balance. You have ₹${loggedUser.walletBalance.toLocaleString("en-IN")} INR, but support requires ₹${supportAmount.toLocaleString("en-IN")} INR.`
      }, { status: 400 });
    }

    // Deduct from supporter's wallet
    loggedUser.walletBalance -= supportAmount;
    await loggedUser.save();

    // Create wallet transaction record for supporter
    await WalletTransaction.create({
      email: loggedUserEmail,
      amount: supportAmount,
      type: "payment",
      status: "success",
      description: `Supported creator ${to_username}`,
      paymentMethod: "Wallet",
    });

    // Find creator user to credit their wallet balance
    const allUsers = await User.find({ role: "creator" });
    const creatorUser = allUsers.find(u => (u.name || u.email.split("@")[0]).toLowerCase().replace(/\s+/g, "") === creatorSlug);

    if (creatorUser) {
      creatorUser.walletBalance = (creatorUser.walletBalance || 0) + supportAmount;
      await creatorUser.save();

      // Create wallet transaction record for creator
      await WalletTransaction.create({
        email: creatorUser.email.toLowerCase(),
        amount: supportAmount,
        type: "deposit",
        status: "success",
        description: `Received support from ${loggedUser.name || loggedUser.email}`,
        paymentMethod: "Wallet",
      });
    }

    const newPayment = await Payment.create({
      name: name?.trim() || "Anonymous Supporter",
      to_username: creatorSlug,
      amount: supportAmount,
      message: message?.trim() || "",
      from_email: loggedUserEmail,
      status: "success",
    });

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error("Error saving support payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
