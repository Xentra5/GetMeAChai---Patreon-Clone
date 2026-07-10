import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import Payment from "@/models/Payment";
import Withdrawal from "@/models/Withdrawal";

export async function GET(request) {
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

    const creatorName = user.name || "Creator";
    const creatorSlug = creatorName.toLowerCase().replace(/\s+/g, "");

    // Query successful payments for this creator
    const payments = await Payment.find({
      to_username: creatorSlug,
      status: "success",
    }).sort({ createdAt: -1 });

    // Query withdrawals
    const withdrawals = await Withdrawal.find({
      creator_email: user.email.toLowerCase(),
    }).sort({ createdAt: -1 });

    // 1. Total Revenue
    const totalRevenue = payments.reduce((acc, pay) => acc + pay.amount, 0);

    // 2. Pending Clearance (payments received in the last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const pendingPayments = payments.filter((pay) => new Date(pay.createdAt) >= threeDaysAgo);
    const pendingClearance = pendingPayments.reduce((acc, pay) => acc + pay.amount, 0);

    // 3. Total Withdrawn
    const totalWithdrawn = withdrawals
      .filter((w) => w.status === "success")
      .reduce((acc, w) => acc + w.amount, 0);

    // 4. Available Balance = Total Revenue - Total Withdrawn - Pending Clearance
    const availableBalance = Math.max(0, totalRevenue - totalWithdrawn - pendingClearance);

    // 5. Combine and format transaction history chronologically
    const history = [];

    payments.forEach((pay) => {
      // Check if it's pending clearance
      const isPending = new Date(pay.createdAt) >= threeDaysAgo;
      history.push({
        id: pay._id,
        date: new Date(pay.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        description: `${pay.name} (${Math.round(pay.amount / 100)} Chais)`,
        method: "-",
        status: isPending ? "pending" : "completed", // pending if inside clearance window
        amount: pay.amount,
        type: "credit",
        createdAt: pay.createdAt,
      });
    });

    withdrawals.forEach((w) => {
      history.push({
        id: w._id,
        date: new Date(w.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        description: "Withdrawal",
        method: w.method,
        status: w.status, // "pending", "success", "failed"
        amount: w.amount,
        type: "debit",
        createdAt: w.createdAt,
      });
    });

    // Sort combined history by actual date descending
    history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      username: creatorName,
      email: user.email,
      avatarUrl: user.avatarUrl || "https://i.pravatar.cc/100?img=11",
      availableBalance,
      pendingClearance,
      totalWithdrawn,
      history,
    });
  } catch (error) {
    console.error("Error in payouts GET API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
