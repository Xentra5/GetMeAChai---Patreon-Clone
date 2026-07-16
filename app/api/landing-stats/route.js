import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import Payment from "@/models/Payment";

export async function GET() {
  try {
    await connectDB();

    // 1. Total Creators Count
    const creatorsCount = await User.countDocuments({ role: "creator" });

    // 2. Successful Payments Aggregation
    const successfulPayments = await Payment.find({ status: "success" }).lean();
    const totalEarnings = successfulPayments.reduce((acc, pay) => acc + pay.amount, 0);
    const chaisBought = successfulPayments.length;

    // 3. Unique Supporters Count
    const distinctEmails = await Payment.distinct("from_email", { status: "success" });
    const distinctNames = await Payment.distinct("name", { status: "success" });
    
    // Merge distinct values, filter out empty emails
    const uniqueEmailsSet = new Set(distinctEmails.filter(Boolean));
    const supportersCount = Math.max(uniqueEmailsSet.size, distinctNames.length);

    return NextResponse.json({
      creatorsCount: creatorsCount || 0,
      totalEarnings: totalEarnings || 0,
      chaisBought: chaisBought || 0,
      supportersCount: supportersCount || 0,
    });
  } catch (error) {
    console.error("Error generating landing stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
