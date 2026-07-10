import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import Payment from "@/models/Payment";
import Withdrawal from "@/models/Withdrawal";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { amount, method } = await request.json();

    if (!amount || amount < 1000) {
      return NextResponse.json({ error: "Minimum withdrawal is ₹1,000." }, { status: 400 });
    }

    const creatorName = user.name || "Creator";
    const creatorSlug = creatorName.toLowerCase().replace(/\s+/g, "");

    // Calculate current available balance to verify
    const payments = await Payment.find({
      to_username: creatorSlug,
      status: "success",
    });

    const withdrawals = await Withdrawal.find({
      creator_email: user.email.toLowerCase(),
      status: "success",
    });

    const totalRevenue = payments.reduce((acc, pay) => acc + pay.amount, 0);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const pendingPayments = payments.filter((pay) => new Date(pay.createdAt) >= threeDaysAgo);
    const pendingClearance = pendingPayments.reduce((acc, pay) => acc + pay.amount, 0);

    const totalWithdrawn = withdrawals.reduce((acc, w) => acc + w.amount, 0);

    const availableBalance = Math.max(0, totalRevenue - totalWithdrawn - pendingClearance);

    if (amount > availableBalance) {
      return NextResponse.json({ error: "Insufficient funds." }, { status: 400 });
    }

    // Create the withdrawal request
    const withdrawal = await Withdrawal.create({
      creator_email: user.email.toLowerCase(),
      amount,
      method: method || "Stripe Bank Transfer",
      status: "success", // Mark success immediately for instant updates
    });

    return NextResponse.json({
      success: true,
      withdrawal,
    });
  } catch (error) {
    console.error("Error in payouts withdraw API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
