import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import Payment from "@/models/Payment";
import Message from "@/models/Message";
import User from "@/models/user";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const loggedUserEmail = session.user.email.toLowerCase();

    // Find if the logged user is a creator
    const creatorUser = await User.findOne({ email: loggedUserEmail });
    const isCreator = creatorUser && creatorUser.role === "creator";
    const creatorSlug = isCreator ? (creatorUser.name || creatorUser.email.split("@")[0]).toLowerCase().replace(/\s+/g, "") : "";

    let conversations = [];

    if (isCreator) {
      // Creator: find all unique supporters who have messaged them or supported them
      const uniqueMsgSenders = await Message.find({ receiverUsername: creatorSlug }).distinct("senderEmail");
      const uniquePaySenders = await Payment.find({ to_username: creatorSlug, status: "success" }).distinct("from_email");

      const allEmails = Array.from(new Set([...uniqueMsgSenders, ...uniquePaySenders]));

      for (const email of allEmails) {
        if (!email) continue;
        const userObj = await User.findOne({ email: email.toLowerCase() });
        const name = userObj ? (userObj.name || userObj.email.split("@")[0]) : email.split("@")[0];
        const avatarUrl = userObj?.avatarUrl || "https://i.pravatar.cc/100?img=11";
        
        // Calculate cumulative support
        const userPayments = await Payment.find({
          from_email: email,
          to_username: creatorSlug,
          status: "success",
        });
        const cumulativeSupport = userPayments.reduce((acc, pay) => acc + pay.amount, 0);

        conversations.push({
          email,
          name,
          username: email.split("@")[0],
          avatarUrl,
          cumulativeSupport,
          isGoldTier: cumulativeSupport >= 1000,
          type: "supporter"
        });
      }
    } else {
      // Supporter: list all creators in the system so they can interact with whoever they want
      const allCreators = await User.find({ role: "creator" }).select("name email avatarUrl monthlyGoal category").lean();

      for (const creator of allCreators) {
        const slug = (creator.name || creator.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
        
        // Check cumulative support by this supporter
        const userPayments = await Payment.find({
          from_email: loggedUserEmail,
          to_username: slug,
          status: "success",
        });
        const cumulativeSupport = userPayments.reduce((acc, pay) => acc + pay.amount, 0);

        if (cumulativeSupport >= 1000) {
          conversations.push({
            email: creator.email,
            name: creator.name || creator.email.split("@")[0],
            username: slug,
            avatarUrl: creator.avatarUrl || "https://i.pravatar.cc/100?img=11",
            cumulativeSupport,
            isGoldTier: true,
            type: "creator"
          });
        }
      }
    }

    return NextResponse.json({ conversations, isCreator });
  } catch (error) {
    console.error("GET Conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
