import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json(
        { error: "No user found with this email" },
        { status: 404 }
      );
    }

    // Verify Password first
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password credentials" },
        { status: 401 }
      );
    }

    // Generate a 6-digit random number code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash and store in user record
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    
    user.twoFactorToken = hashedOtp;
    user.twoFactorExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || "noreply@getmeachai.com";
    const senderName = process.env.BREVO_SENDER_NAME || "GetMeAChai";

    if (brevoApiKey) {
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: user.email, name: user.name || "User" }],
          subject: `${otp} is your GetMeAChai login verification code`,
          htmlContent: `
            <div style="background-color: #0b0f19; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="max-width: 500px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
                <!-- Header/Logo area -->
                <div style="background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid #1f2937;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                    🔒 GetMeAChai Security
                  </h1>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 35px 30px; color: #f3f4f6; text-align: center;">
                  <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 20px; font-weight: 700; color: #ffffff;">Two-Factor Authentication</h2>
                  <p style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 25px;">
                    Please enter the following verification code to complete your login request:
                  </p>
                  
                  <!-- OTP Code block -->
                  <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 20px; border-radius: 12px; display: inline-block; margin: 15px 0;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #60a5fa; font-family: monospace;">
                      ${otp}
                    </span>
                  </div>
                  
                  <p style="font-size: 13px; color: #9ca3af; margin-top: 20px;">
                    This code is valid for <strong>5 minutes</strong>. If you did not request this code, please secure your account credentials.
                  </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #0b0f19; padding: 20px; text-align: center; border-top: 1px solid #1f2937;">
                  <p style="margin: 0; color: #4b5563; font-size: 12px;">&copy; ${new Date().getFullYear()} GetMeAChai. All rights reserved.</p>
                </div>
              </div>
            </div>
          `,
        }),
      });

      if (!brevoRes.ok) {
        const errorData = await brevoRes.json();
        console.error("Brevo 2FA OTP Error:", errorData);
      }
    } else {
      console.log("\n=======================================================");
      console.log("🔒 [DEV SIMULATION] BREVO_API_KEY not found in .env.local");
      console.log(`2FA OTP Code for ${user.email}: ${otp}`);
      console.log("=======================================================\n");
    }

    return NextResponse.json({ success: true, message: "Verification code sent successfully" });
  } catch (error) {
    console.error("2FA Send OTP error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
