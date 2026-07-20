import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import Message from "@/models/Message";
import Payment from "@/models/Payment";
import User from "@/models/user";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator");
    const supporter = searchParams.get("supporter");

    if (!creator) {
      return NextResponse.json({ error: "Creator username is required" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const creatorSlug = creator.toLowerCase().replace(/\s+/g, "");
    const loggedUserEmail = session.user.email.toLowerCase();

    // Check if logged-in user is creator owner
    const creatorUser = await User.findOne({ email: loggedUserEmail });
    let isOwner = false;
    if (creatorUser) {
      const creatorUserSlug = (creatorUser.name || creatorUser.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
      if (creatorUserSlug === creatorSlug) {
        isOwner = true;
      }
    }

    // Determine the supporter email channel to load
    const activeSupporterEmail = isOwner ? (supporter || "").toLowerCase() : loggedUserEmail;

    if (!activeSupporterEmail) {
      return NextResponse.json({ error: "Supporter email is required" }, { status: 400 });
    }

    // Verify Gold Tier status (cumulative support >= 1000 INR)
    const userPayments = await Payment.find({
      from_email: activeSupporterEmail,
      to_username: creatorSlug,
      status: "success",
    });
    const cumulativeSupport = userPayments.reduce((acc, pay) => acc + pay.amount, 0);
    const isGoldTier = cumulativeSupport >= 1000;

    if (!isOwner && !isGoldTier) {
      return NextResponse.json({ error: "Messaging is gated to Gold Tier supporters (cumulative support of ₹1,000+ or $12.00+)" }, { status: 403 });
    }

    // Load conversation messages
    const messages = await Message.find({
      receiverUsername: creatorSlug,
      supporterEmail: activeSupporterEmail
    }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ messages, isOwner, isGoldTier, cumulativeSupport });
  } catch (error) {
    console.error("GET Messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { creator, supporter, content } = await request.json();
    if (!creator || !content || !content.trim()) {
      return NextResponse.json({ error: "Creator username and content are required" }, { status: 400 });
    }

    await connectDB();
    const creatorSlug = creator.toLowerCase().replace(/\s+/g, "");
    const loggedUserEmail = session.user.email.toLowerCase();

    // Check if sender is creator owner
    const creatorUser = await User.findOne({ email: loggedUserEmail });
    let isOwner = false;
    if (creatorUser) {
      const creatorUserSlug = (creatorUser.name || creatorUser.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
      if (creatorUserSlug === creatorSlug) {
        isOwner = true;
      }
    }

    const activeSupporterEmail = isOwner ? (supporter || "").toLowerCase() : loggedUserEmail;

    if (!activeSupporterEmail) {
      return NextResponse.json({ error: "Supporter email is required" }, { status: 400 });
    }

    // Verify Gold Tier status
    const userPayments = await Payment.find({
      from_email: activeSupporterEmail,
      to_username: creatorSlug,
      status: "success",
    });
    const cumulativeSupport = userPayments.reduce((acc, pay) => acc + pay.amount, 0);
    const isGoldTier = cumulativeSupport >= 1000;

    if (!isOwner && !isGoldTier) {
      return NextResponse.json({ error: "Messaging is gated to Gold Tier supporters (cumulative support of ₹1,000+ or $12.00+)" }, { status: 403 });
    }

    const newMessage = await Message.create({
      senderEmail: loggedUserEmail,
      senderName: session.user.name || session.user.email.split("@")[0] || "Anonymous",
      receiverUsername: creatorSlug,
      supporterEmail: activeSupporterEmail,
      content: content.trim(),
    });

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("POST Messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
