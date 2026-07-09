import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import User from "@/models/user";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { monthlyGoal, twitterHandle, githubHandle } = await request.json();

    // Validate monthlyGoal if provided
    if (monthlyGoal !== undefined) {
      const parsedGoal = Number(monthlyGoal);
      if (isNaN(parsedGoal) || parsedGoal < 0) {
        return NextResponse.json(
          { error: "Monthly goal must be a positive number" },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const updateFields = {};
    if (monthlyGoal !== undefined) updateFields.monthlyGoal = Number(monthlyGoal);
    if (twitterHandle !== undefined) updateFields.twitterHandle = twitterHandle.trim();
    if (githubHandle !== undefined) updateFields.githubHandle = githubHandle.trim();

    const user = await User.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      { $set: updateFields },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      user: {
        monthlyGoal: user.monthlyGoal,
        twitterHandle: user.twitterHandle,
        githubHandle: user.githubHandle,
      },
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
