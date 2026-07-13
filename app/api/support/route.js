import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import Payment from "@/models/Payment";
import User from "@/models/user";

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
      .limit(10)
      .lean();

    const isMember = isOwner || userCumulativeAmount >= 100;

    const processedPayments = payments.map((pay) => {
      if (isMember) {
        return pay;
      }
      return {
        _id: pay._id,
        name: "Supporter",
        amount: pay.amount,
        message: "🔒 Locked. Support this creator to unlock the message feed!",
        createdAt: pay.createdAt,
        to_username: pay.to_username,
        status: pay.status,
      };
    });

    return NextResponse.json({
      payments: processedPayments,
      isMember,
    });
  } catch (error) {
    console.error("Error fetching support payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    const { name, to_username, amount, message } = await request.json();

    if (!to_username || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const creatorSlug = to_username.toLowerCase().replace(/\s+/g, "");

    const newPayment = await Payment.create({
      name: name?.trim() || "Anonymous Supporter",
      to_username: creatorSlug,
      amount: Number(amount),
      message: message?.trim() || "",
      from_email: session?.user?.email ? session.user.email.toLowerCase() : "",
      status: "success", // Mocking success for simulation
    });

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error("Error saving support payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
