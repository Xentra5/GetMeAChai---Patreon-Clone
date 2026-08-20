import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, otp, signupToken } = body;

    // Connect to database
    await connectDB();

    // ==========================================
    // STEP 2: Verify OTP & Create Account
    // ==========================================
    if (signupToken && otp) {
      try {
        // Decode and parse signup token
        const tokenData = JSON.parse(Buffer.from(signupToken, "base64").toString());
        const { payloadStr, signature } = tokenData;

        // Verify cryptographic signature to prevent client tampering
        const expectedSignature = crypto
          .createHmac("sha256", process.env.NEXTAUTH_SECRET || "getchai_super_secret_key_2024_xyz")
          .update(payloadStr)
          .digest("hex");

        if (signature !== expectedSignature) {
          return NextResponse.json({ error: "Invalid registration session signature" }, { status: 400 });
        }

        const payload = JSON.parse(payloadStr);

        // Verify expiration (10 minutes)
        if (Date.now() > payload.expires) {
          return NextResponse.json({ error: "Verification session expired. Please sign up again." }, { status: 400 });
        }

        // Verify OTP code
        const hashedOtpInput = crypto.createHash("sha256").update(otp.trim()).digest("hex");
        if (hashedOtpInput !== payload.otpHash) {
          return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
        }

        // Check if user was registered in the meantime
        const existingUser = await User.findOne({ email: payload.email });
        if (existingUser) {
          return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
        }

        // Hash the password securely
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(payload.password, salt);

        // Create user
        const newUser = await User.create({
          name: payload.name,
          email: payload.email,
          password: hashedPassword,
        });

        return NextResponse.json(
          {
            message: "User registered successfully",
            user: { id: newUser._id, email: newUser.email, name: newUser.name },
          },
          { status: 201 }
        );
      } catch (err) {
        console.error("OTP verification error:", err);
        return NextResponse.json({ error: "Verification failed. Please request a new code." }, { status: 400 });
      }
    }

    // ==========================================
    // STEP 1: Validate Registration & Send OTP
    // ==========================================
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and at least one special character (e.g. @, #, !, $, %, etc.)." },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 });
    }

    // Generate 6-digit random code (OTP)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otpCode).digest("hex");
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Create a cryptographically signed registration session token
    const payload = { name, email: email.toLowerCase().trim(), password, otpHash, expires };
    const payloadStr = JSON.stringify(payload);
    const signature = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET || "getchai_super_secret_key_2024_xyz")
      .update(payloadStr)
      .digest("hex");

    const newSignupToken = Buffer.from(JSON.stringify({ payloadStr, signature })).toString("base64");

    // Send email using Brevo
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "noreply@getmeachai.com";
    const senderName = process.env.BREVO_SENDER_NAME || "GetMeAChai";

    if (brevoApiKey) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: email.toLowerCase().trim(), name: name || "User" }],
          subject: `${otpCode} is your GetMeAChai registration code`,
          htmlContent: `
            <div style="background-color: #0b0f19; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="max-width: 500px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
                <div style="background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid #1f2937;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                    ☕ GetMeAChai Registration
                  </h1>
                </div>
                <div style="padding: 35px 30px; color: #f3f4f6; text-align: center;">
                  <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 20px; font-weight: 700; color: #ffffff;">Email Verification Code</h2>
                  <p style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 25px;">
                    Please enter the verification code below to verify your email address and create your account:
                  </p>
                  <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 20px; border-radius: 12px; display: inline-block; margin: 15px 0;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #a855f7; font-family: monospace;">
                      ${otpCode}
                    </span>
                  </div>
                  <p style="font-size: 13px; color: #9ca3af; margin-top: 20px;">
                    This code is valid for <strong>10 minutes</strong>.
                  </p>
                </div>
                <div style="background-color: #0b0f19; padding: 20px; text-align: center; border-top: 1px solid #1f2937;">
                  <p style="margin: 0; color: #4b5563; font-size: 12px;">&copy; ${new Date().getFullYear()} GetMeAChai. All rights reserved.</p>
                </div>
              </div>
            </div>
          `,
        }),
      });
    } else {
      console.log("\n=======================================================");
      console.log("🔒 [DEV SIMULATION] BREVO_API_KEY not found in .env.local");
      console.log(`Registration OTP Code for ${email}: ${otpCode}`);
      console.log("=======================================================\n");
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
      signupToken: newSignupToken,
    });
  } catch (error) {
    console.error("Signup Route Error:", error);
    return NextResponse.json({ error: "Internal server error occurred" }, { status: 500 });
  }
}
