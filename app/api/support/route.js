import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import Payment from "@/models/Payment";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator");

    if (!creator) {
      return NextResponse.json({ error: "Creator username is required" }, { status: 400 });
    }

    await connectDB();

    const creatorSlug = creator.toLowerCase().replace(/\s+/g, "");

    const payments = await Payment.find({
      to_username: creatorSlug,
      status: "success",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching support payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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
      status: "success", // Mocking success for simulation
    });

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error("Error saving support payment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
