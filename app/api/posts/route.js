import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import Post from "@/models/Post";
import Payment from "@/models/Payment";
import User from "@/models/user";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator");

    if (!creator) {
      return NextResponse.json({ error: "Creator parameter is required" }, { status: 400 });
    }

    const creatorSlug = creator.toLowerCase().replace(/\s+/g, "");

    await connectDB();

    const session = await getServerSession(authOptions);

    // 1. Calculate cumulative support by the logged-in user
    let userCumulativeAmount = 0;
    let isCreatorOwner = false;

    if (session?.user?.email) {
      const loggedUserEmail = session.user.email.toLowerCase();

      // Check if logged-in user is the creator owner
      const creatorUser = await User.findOne({ email: loggedUserEmail });
      if (creatorUser) {
        const creatorUserSlug = (creatorUser.name || creatorUser.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
        if (creatorUserSlug === creatorSlug) {
          isCreatorOwner = true;
        }
      }

      // Calculate total donation support
      const userPayments = await Payment.find({
        from_email: loggedUserEmail,
        to_username: creatorSlug,
        status: "success",
      });
      userCumulativeAmount = userPayments.reduce((acc, pay) => acc + pay.amount, 0);
    }

    // 2. Fetch posts
    const posts = await Post.find({ creator_username: creatorSlug }).sort({ createdAt: -1 }).lean();

    // 3. Apply gating rules
    const processedPosts = posts.map((post) => {
      const isUnlocked = isCreatorOwner || userCumulativeAmount >= post.minAmountRequired || post.minAmountRequired === 0;
      return {
        _id: post._id,
        title: post.title,
        content: isUnlocked ? post.content : `🔒 This content is gated. You have supported ₹${userCumulativeAmount} so far. Support at least ₹${post.minAmountRequired} cumulatively to unlock this update!`,
        minAmountRequired: post.minAmountRequired,
        isLocked: !isUnlocked,
        createdAt: post.createdAt,
      };
    });

    return NextResponse.json({
      posts: processedPosts,
      cumulativeSupport: userCumulativeAmount,
      isOwner: isCreatorOwner,
    });
  } catch (error) {
    console.error("Error in posts GET API:", error);
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

    const loggedUser = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!loggedUser || loggedUser.role !== "creator") {
      return NextResponse.json({ error: "Only creators can publish updates." }, { status: 403 });
    }

    const { title, content, minAmountRequired } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
    }

    const creatorName = loggedUser.name || loggedUser.email.split("@")[0];
    const creatorSlug = creatorName.toLowerCase().replace(/\s+/g, "");

    const newPost = await Post.create({
      title: title.trim(),
      content: content.trim(),
      creator_username: creatorSlug,
      minAmountRequired: Number(minAmountRequired) || 0,
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (error) {
    console.error("Error in posts POST API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
