import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name || "",
      email: user.email,
      role: user.role || "student",
      monthlyGoal: user.monthlyGoal,
      category: user.category || "Engineering",
      twitterHandle: user.twitterHandle || "",
      githubHandle: user.githubHandle || "",
      avatarUrl: user.avatarUrl || "https://i.pravatar.cc/100?img=11",
      coverUrl: user.coverUrl || "",
      profileViews: user.profileViews || 0,
      supportToken: user.supportToken || "Chai",
      bronzePrice: user.bronzePrice ?? 100,
      silverPrice: user.silverPrice ?? 500,
      goldPrice: user.goldPrice ?? 1000,
      payoutScheduleFrequency: user.payoutScheduleFrequency || "Every Friday",
      payoutNextDate: user.payoutNextDate || "Friday, Oct 25",
      payoutProcessingTime: user.payoutProcessingTime || "1-2 business days",
      payoutMinimumThreshold: user.payoutMinimumThreshold ?? 1000,
      is2FAEnabled: user.is2FAEnabled ?? false,
    });
  } catch (error) {
    console.error("GET Settings error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      monthlyGoal,
      twitterHandle,
      githubHandle,
      name,
      category,
      supportToken,
      bronzePrice,
      silverPrice,
      goldPrice,
      payoutScheduleFrequency,
      payoutNextDate,
      payoutProcessingTime,
      payoutMinimumThreshold,
      avatarUrl,
      coverUrl,
      currentPassword,
      newPassword,
      toggle2FA,
      confirmPasswordFor2FA,
    } = await request.json();

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

    const userToVerify = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!userToVerify) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateFields = {};

    // 2FA activation/deactivation security step
    if (toggle2FA !== undefined) {
      if (!confirmPasswordFor2FA) {
        return NextResponse.json(
          { error: "Password verification required to modify 2FA settings" },
          { status: 400 }
        );
      }
      const isMatch = await bcrypt.compare(confirmPasswordFor2FA, userToVerify.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Incorrect password verification" },
          { status: 400 }
        );
      }
      updateFields.is2FAEnabled = toggle2FA;
    }
    if (monthlyGoal !== undefined) updateFields.monthlyGoal = Number(monthlyGoal);
    if (twitterHandle !== undefined) updateFields.twitterHandle = twitterHandle.trim();
    if (githubHandle !== undefined) updateFields.githubHandle = githubHandle.trim();
    if (name !== undefined) updateFields.name = name.trim();
    if (category !== undefined) updateFields.category = category.trim();
    if (supportToken !== undefined) updateFields.supportToken = supportToken.trim();
    if (bronzePrice !== undefined) updateFields.bronzePrice = Number(bronzePrice);
    if (silverPrice !== undefined) updateFields.silverPrice = Number(silverPrice);
    if (goldPrice !== undefined) updateFields.goldPrice = Number(goldPrice);
    if (payoutScheduleFrequency !== undefined) updateFields.payoutScheduleFrequency = payoutScheduleFrequency.trim();
    if (payoutNextDate !== undefined) updateFields.payoutNextDate = payoutNextDate.trim();
    if (payoutProcessingTime !== undefined) updateFields.payoutProcessingTime = payoutProcessingTime.trim();
    if (payoutMinimumThreshold !== undefined) updateFields.payoutMinimumThreshold = Number(payoutMinimumThreshold);
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl.trim();
    if (coverUrl !== undefined) updateFields.coverUrl = coverUrl.trim();

    if (currentPassword && newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters long" },
          { status: 400 }
        );
      }
      const isMatch = await bcrypt.compare(currentPassword, userToVerify.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 }
        );
      }
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(newPassword, salt);
    }

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
      user,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
