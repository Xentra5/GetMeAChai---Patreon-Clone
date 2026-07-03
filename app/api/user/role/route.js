import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import User from "@/models/user";

export async function POST(request) {
  try {
    // 1. Get the current user session
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    // 2. Connect to the database
    await connectDB();

    // 3. Parse the selected role from request body
    const { role } = await request.json();
    if (!role || !["student", "creator"].includes(role.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid role selected." },
        { status: 400 }
      );
    }

    // 4. Update the user's role in the database
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { role: role.toLowerCase() },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found in database." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Role updated successfully",
        user: {
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Role update API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
