import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import User from "@/models/user";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy");

    await connectDB();
    
    // Build query filters
    const queryObj = { role: "creator" };

    if (q && q.trim()) {
      const searchRegex = { $regex: q.trim(), $options: "i" };
      queryObj.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { twitterHandle: searchRegex },
        { githubHandle: searchRegex }
      ];
    }

    if (category && category !== "All") {
      queryObj.category = category;
    }

    // Build sort options
    let sortObj = { profileViews: -1 }; // default: popularity
    if (sortBy === "name") {
      sortObj = { name: 1 };
    } else if (sortBy === "goal") {
      sortObj = { monthlyGoal: -1 };
    } else if (sortBy === "views") {
      sortObj = { profileViews: -1 };
    }

    // Fetch users whose role is "creator"
    const creators = await User.find(queryObj)
      .select("name email avatarUrl twitterHandle githubHandle monthlyGoal profileViews category supportToken")
      .sort(sortObj)
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
