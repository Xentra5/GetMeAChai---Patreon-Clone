import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import PayoutMethod from "@/models/PayoutMethod";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const methods = await PayoutMethod.find({
      creator_email: session.user.email.toLowerCase(),
    }).sort({ createdAt: -1 });

    return NextResponse.json({ methods });
  } catch (error) {
    console.error("Error in GET payout methods:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { type, methodType, details } = body;

    if (!type || !methodType || !details) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const email = session.user.email.toLowerCase();

    // Check if there are any existing methods for this user
    const existingMethodsCount = await PayoutMethod.countDocuments({
      creator_email: email,
    });

    // If first method, set isDefault to true
    const isDefault = existingMethodsCount === 0;

    const newMethod = await PayoutMethod.create({
      creator_email: email,
      type,
      methodType,
      details,
      isDefault,
    });

    return NextResponse.json({ success: true, method: newMethod });
  } catch (error) {
    console.error("Error in POST payout methods:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
