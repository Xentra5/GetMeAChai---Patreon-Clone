import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import Payment from "@/models/Payment";
import User from "@/models/user";
import WalletTransaction from "@/models/WalletTransaction";
import { supportSchema } from "@/lib/validations";
import mongoose from "mongoose";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get("creator");

    if (!creator) {
      return NextResponse.json({ error: "Creator username is required" }, { status: 400 });
    }

    await connectDB();

    const creatorSlug = creator.toLowerCase().replace(/\s+/g, "");
    const session = await getServerSession(authOptions);

    let isOwner = false;
    let userCumulativeAmount = 0;

    if (session?.user?.email) {
      const loggedUserEmail = session.user.email.toLowerCase();

      // Check if logged-in user is the creator owner
      const creatorUser = await User.findOne({ email: loggedUserEmail });
      if (creatorUser) {
        const creatorUserSlug = (creatorUser.name || creatorUser.email.split("@")[0]).toLowerCase().replace(/\s+/g, "");
        if (creatorUserSlug === creatorSlug) {
          isOwner = true;
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

    const payments = await Payment.find({
      to_username: creatorSlug,
      status: "success",
    })
      .sort({ createdAt: -1 })
      .lean();

    const fromEmails = [...new Set(payments.map(p => p.from_email).filter(Boolean))];
    const users = await User.find({ email: { $in: fromEmails } }, { email: 1, avatarUrl: 1 });
    const userMap = new Map(users.map(u => [u.email.toLowerCase(), u.avatarUrl]));

    const isMember = isOwner || userCumulativeAmount >= 100;

    const processedPayments = payments.map((pay) => {
      const supporterAvatar = pay.from_email ? userMap.get(pay.from_email.toLowerCase()) : null;
      const basePay = {
        ...pay,
        avatarUrl: supporterAvatar || "https://i.pravatar.cc/100?img=11",
      };
      if (isMember) {
        return basePay;
      }
      return {
        ...basePay,
        name: "Supporter",
        message: "🔒 Locked. Support this creator to unlock the message feed!",
      };
    });

    const totalSupportSum = payments.reduce((acc, pay) => acc + pay.amount, 0);

    return NextResponse.json({
      payments: processedPayments,
      isMember,
      totalSupportSum,
    });
  } catch (error) {
    console.error("Error fetching support payments:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Please sign in to support creators." }, { status: 401 });
    }

    const body = await request.json();

    // 1. Zod Input Schema Validation
    const parseResult = supportSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues[0]?.message || "Invalid input data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, to_username: creatorSlug, amount: supportAmount, message, paymentMethod } = parseResult.data;
    const loggedUserEmail = session.user.email.toLowerCase();

    await connectDB();

    const isDirectPayment = paymentMethod === "Razorpay";
    let newPayment = null;

    // 2. Transaction Execution with Session (ACID compliance)
    const dbSession = await mongoose.startSession();
    try {
      await dbSession.withTransaction(async () => {
        let loggedUser = null;

        if (isDirectPayment) {
          loggedUser = await User.findOne({ email: loggedUserEmail }).session(dbSession);
          if (!loggedUser) {
            throw new Error("Supporter profile not found.");
          }

          await WalletTransaction.create(
            [
              {
                email: loggedUserEmail,
                amount: supportAmount,
                type: "payment",
                status: "success",
                description: `Supported creator ${creatorSlug} via Razorpay`,
                paymentMethod: "Razorpay",
              },
            ],
            { session: dbSession }
          );
        } else {
          // Atomically deduct wallet balance
          loggedUser = await User.findOneAndUpdate(
            { email: loggedUserEmail, walletBalance: { $gte: supportAmount } },
            { $inc: { walletBalance: -supportAmount } },
            { new: true, session: dbSession }
          );

          if (!loggedUser) {
            throw new Error("Insufficient wallet balance or supporter profile not found.");
          }

          await WalletTransaction.create(
            [
              {
                email: loggedUserEmail,
                amount: supportAmount,
                type: "payment",
                status: "success",
                description: `Supported creator ${creatorSlug}`,
                paymentMethod: "Wallet",
              },
            ],
            { session: dbSession }
          );
        }

        // Find creator user to credit their wallet balance
        const allUsers = await User.find({ role: "creator" }).session(dbSession);
        const creatorUser = allUsers.find(
          (u) => (u.name || u.email.split("@")[0]).toLowerCase().replace(/\s+/g, "") === creatorSlug
        );

        if (creatorUser) {
          creatorUser.walletBalance = (creatorUser.walletBalance || 0) + supportAmount;
          await creatorUser.save({ session: dbSession });

          await WalletTransaction.create(
            [
              {
                email: creatorUser.email.toLowerCase(),
                amount: supportAmount,
                type: "deposit",
                status: "success",
                description: `Received support from ${loggedUser.name || loggedUser.email}`,
                paymentMethod: isDirectPayment ? "Razorpay" : "Wallet",
              },
            ],
            { session: dbSession }
          );
        }

        const createdPayments = await Payment.create(
          [
            {
              name: name || "Anonymous Supporter",
              to_username: creatorSlug,
              amount: supportAmount,
              message: message || "",
              from_email: loggedUserEmail,
              status: "success",
            },
          ],
          { session: dbSession }
        );

        newPayment = createdPayments[0];
      });
    } catch (txError) {
      // Fallback for non-replica set MongoDB environments (like single-node local dev)
      if (txError.message?.includes("Transaction numbers are only allowed on a replica set member")) {
        console.warn("MongoDB transactions require a replica set. Falling back to non-session operations.");
        let loggedUser = null;
        if (isDirectPayment) {
          loggedUser = await User.findOne({ email: loggedUserEmail });
          if (!loggedUser) return NextResponse.json({ error: "Supporter profile not found." }, { status: 400 });
          await WalletTransaction.create({
            email: loggedUserEmail,
            amount: supportAmount,
            type: "payment",
            status: "success",
            description: `Supported creator ${creatorSlug} via Razorpay`,
            paymentMethod: "Razorpay",
          });
        } else {
          loggedUser = await User.findOneAndUpdate(
            { email: loggedUserEmail, walletBalance: { $gte: supportAmount } },
            { $inc: { walletBalance: -supportAmount } },
            { new: true }
          );
          if (!loggedUser) return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 400 });
          await WalletTransaction.create({
            email: loggedUserEmail,
            amount: supportAmount,
            type: "payment",
            status: "success",
            description: `Supported creator ${creatorSlug}`,
            paymentMethod: "Wallet",
          });
        }

        const allUsers = await User.find({ role: "creator" });
        const creatorUser = allUsers.find(
          (u) => (u.name || u.email.split("@")[0]).toLowerCase().replace(/\s+/g, "") === creatorSlug
        );

        if (creatorUser) {
          creatorUser.walletBalance = (creatorUser.walletBalance || 0) + supportAmount;
          await creatorUser.save();
          await WalletTransaction.create({
            email: creatorUser.email.toLowerCase(),
            amount: supportAmount,
            type: "deposit",
            status: "success",
            description: `Received support from ${loggedUser.name || loggedUser.email}`,
            paymentMethod: isDirectPayment ? "Razorpay" : "Wallet",
          });
        }

        newPayment = await Payment.create({
          name: name || "Anonymous Supporter",
          to_username: creatorSlug,
          amount: supportAmount,
          message: message || "",
          from_email: loggedUserEmail,
          status: "success",
        });
      } else {
        throw txError;
      }
    } finally {
      await dbSession.endSession();
    }

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (error) {
    console.error("Error saving support payment:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

