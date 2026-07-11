import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import User from "@/models/user";

export async function GET() {
  try {
    await connectDB();
    
    // Fetch users whose role is "creator"
    const creators = await User.find({ role: "creator" })
      .select("name email avatarUrl twitterHandle githubHandle monthlyGoal profileViews")
      .lean();

    return NextResponse.json(creators);
  } catch (error) {
    console.error("Error fetching creators:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
