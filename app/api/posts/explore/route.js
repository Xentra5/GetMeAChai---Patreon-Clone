import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import Post from "@/models/Post";
import User from "@/models/user";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "24", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    await connectDB();

    // 1. Fetch all verified creators
    const creatorQuery = { role: "creator", isCreatorVerified: true };
    if (category && category !== "All") {
      creatorQuery.category = category;
    }

    const creators = await User.find(creatorQuery)
      .select("name email avatarUrl category twitterHandle githubHandle")
      .lean();

    if (creators.length === 0) {
      return NextResponse.json({ posts: [], total: 0 });
    }

    // Build a map of creator_username -> creator info for quick lookup
    const creatorMap = {};
    creators.forEach((c) => {
      const slug = (c.name || c.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
      creatorMap[slug] = {
        name: c.name || c.email.split("@")[0],
        avatarUrl: c.avatarUrl || "",
        category: c.category || "Engineering",
        handle: c.twitterHandle || c.githubHandle || slug,
        email: c.email,
      };
    });

    const creatorSlugs = Object.keys(creatorMap);

    // 2. Fetch posts from all those creators (only public/free posts shown in explore)
    const total = await Post.countDocuments({ creator_username: { $in: creatorSlugs } });
    const posts = await Post.find({ creator_username: { $in: creatorSlugs } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 3. Join creator info into each post
    const enrichedPosts = posts.map((post) => {
      const creator = creatorMap[post.creator_username] || {
        name: post.creator_username,
        avatarUrl: "",
        category: "Engineering",
        handle: post.creator_username,
      };

      const isExclusive = post.minAmountRequired > 0;

      return {
        _id: post._id,
        title: post.title,
        // Tease content: show first 120 chars for locked posts
        content: isExclusive
          ? post.content.substring(0, 120) + (post.content.length > 120 ? "…" : "")
          : post.content,
        isExclusive,
        minAmountRequired: post.minAmountRequired,
        createdAt: post.createdAt,
        creator_username: post.creator_username,
        creatorName: creator.name,
        creatorAvatar: creator.avatarUrl,
        creatorCategory: creator.category,
        creatorHandle: creator.handle,
        rewardName: post.rewardName || "",
      };
    });

    return NextResponse.json({ posts: enrichedPosts, total });
  } catch (error) {
    console.error("Explore posts API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
