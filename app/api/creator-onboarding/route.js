import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/db/connectDb";
import User from "@/models/user";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in first." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      dob,
      phone,
      socialTwitterConnected,
      socialGithubConnected,
      twitterHandle,
      githubHandle,
      fileName,
      fileAttached,
      payoutMethod,
      payoutDetails,
      agreedTerms,
    } = body;

    // Validate mandatory fields
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Legal Full Name is required." }, { status: 400 });
    }
    if (!dob || !dob.trim()) {
      return NextResponse.json({ error: "Date of Birth is required." }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }
    if (!socialTwitterConnected && !socialGithubConnected && !fileAttached) {
      return NextResponse.json(
        { error: "Proof of audience (Twitter/GitHub) or Government ID attachment is required." },
        { status: 400 }
      );
    }
    if (!payoutDetails || !payoutDetails.trim()) {
      return NextResponse.json({ error: "Payout account details are required." }, { status: 400 });
    }
    if (!agreedTerms) {
      return NextResponse.json({ error: "You must agree to the Terms of Service." }, { status: 400 });
    }

    await connectDB();

    const updateData = {
      role: "creator",
      name: fullName.trim(),
      dob: dob.trim(),
      phone: phone.trim(),
      payoutMethod: payoutMethod || "stripe",
      payoutDetails: payoutDetails.trim(),
      agreedTerms: true,
      onboardingCompleted: true,
      isCreatorVerified: true,
    };

    if (twitterHandle) {
      updateData.twitterHandle = twitterHandle.replace('@', '').trim();
    }
    if (githubHandle) {
      updateData.githubHandle = githubHandle.replace('@', '').trim();
    }
    if (fileName) {
      updateData.idDocumentName = fileName;
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email.toLowerCase() },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Creator onboarding completed successfully! Your creator profile is verified.",
        user: {
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
          isCreatorVerified: user.isCreatorVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Creator onboarding API error:", error);
    return NextResponse.json(
      { error: "Internal server error submitting onboarding data." },
      { status: 500 }
    );
  }
}
