import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import PayoutMethod from "@/models/PayoutMethod";

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Method ID is required" }, { status: 400 });
    }

    await connectDB();

    const email = session.user.email.toLowerCase();

    // Check if the method exists and belongs to the user
    const method = await PayoutMethod.findOne({ _id: id, creator_email: email });
    if (!method) {
      return NextResponse.json({ error: "Payout method not found" }, { status: 404 });
    }

    const wasDefault = method.isDefault;

    await PayoutMethod.deleteOne({ _id: id });

    // If we deleted the default method, make another method default
    if (wasDefault) {
      const remainingMethod = await PayoutMethod.findOne({ creator_email: email });
      if (remainingMethod) {
        remainingMethod.isDefault = true;
        await remainingMethod.save();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE payout method:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Method ID is required" }, { status: 400 });
    }

    await connectDB();

    const email = session.user.email.toLowerCase();

    // Check if the method exists and belongs to the user
    const method = await PayoutMethod.findOne({ _id: id, creator_email: email });
    if (!method) {
      return NextResponse.json({ error: "Payout method not found" }, { status: 404 });
    }

    // Unset isDefault for all other methods of this creator
    await PayoutMethod.updateMany(
      { creator_email: email, _id: { $ne: id } },
      { $set: { isDefault: false } }
    );

    // Set default for this method
    method.isDefault = true;
    await method.save();

    return NextResponse.json({ success: true, method });
  } catch (error) {
    console.error("Error in PATCH payout method:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
