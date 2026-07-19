import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import WalletTransaction from "@/models/WalletTransaction";

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

    // Query wallet transactions for this user
    const transactions = await WalletTransaction.find({
      email: user.email.toLowerCase(),
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      walletBalance: user.walletBalance || 0,
      email: user.email,
      username: user.name || "User",
      avatarUrl: user.avatarUrl || "https://i.pravatar.cc/100?img=11",
      history: transactions.map((tx) => ({
        id: tx._id,
        date: new Date(tx.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        description: tx.description,
        method: tx.paymentMethod,
        status: tx.status,
        amount: tx.amount,
        type: tx.type === "deposit" ? "credit" : "debit",
        createdAt: tx.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error in wallet GET API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, paymentMethod } = await request.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const depositAmount = Number(amount);

    // Update user balance
    user.walletBalance = (user.walletBalance || 0) + depositAmount;
    await user.save();

    // Create transaction log
    const transaction = await WalletTransaction.create({
      email: user.email.toLowerCase(),
      amount: depositAmount,
      type: "deposit",
      status: "success",
      description: "Added funds to wallet",
      paymentMethod: paymentMethod || "Card",
    });

    return NextResponse.json({
      success: true,
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.error("Error in wallet POST API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
