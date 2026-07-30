import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/db/connectDb";
import User from "@/models/user";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond with success message for security (prevents email enumeration)
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists with this email, a reset link has been sent." },
        { status: 200 }
      );
    }

    // Generate random reset token & 15 min expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    // Reset Link URL
    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SENDER_EMAIL || "noreply@getmeachai.com";
    const senderName = process.env.BREVO_SENDER_NAME || "GetMeAChai";

    if (brevoApiKey) {
      // Send email using Brevo Transactional Email API (v3)
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
          subject: "Reset your GetMeAChai password",
          htmlContent: `
            <div style="background-color: #0b0f19; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="max-width: 500px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
                <!-- Header/Logo area -->
                <div style="background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%); padding: 30px 20px; text-align: center; border-bottom: 1px solid #1f2937;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                    ☕ GetMeAChai
                  </h1>
                  <p style="margin: 5px 0 0 0; color: #a5b4fc; font-size: 14px; font-weight: 500;">Support Creators, One Chai at a Time</p>
                </div>
                
                <!-- Body Content -->
                <div style="padding: 35px 30px; color: #f3f4f6;">
                  <h2 style="margin-top: 0; margin-bottom: 15px; font-size: 20px; font-weight: 700; color: #ffffff;">Reset Your Password</h2>
                  <p style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 25px;">
                    Hi <strong>${user.name || "there"}</strong>,
                  </p>
                  <p style="font-size: 15px; line-height: 1.6; color: #d1d5db; margin-bottom: 30px;">
                    We received a request to reset your password. Click the secure button below to set a new password. This link is valid for <strong>15 minutes</strong>.
                  </p>
                  
                  <!-- Button -->
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; background-image: linear-gradient(to right, #2563eb, #3b82f6); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2); transition: all 0.2s ease;">
                      Reset Password
                    </a>
                  </div>
                  
                  <div style="border-top: 1px solid #1f2937; padding-top: 25px; margin-top: 30px;">
                    <p style="color: #9ca3af; font-size: 13px; line-height: 1.5; margin: 0 0 10px 0;">
                      If you did not request a password reset, you can safely ignore this email.
                    </p>
                    <p style="color: #6b7280; font-size: 11px; line-height: 1.4; word-break: break-all; margin: 0;">
                      If the button doesn't work, copy and paste this URL into your browser:<br/>
                      <a href="${resetUrl}" style="color: #3b82f6; text-decoration: none;">${resetUrl}</a>
                    </p>
                  </div>
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
        console.error("Brevo API Email Error:", errorData);
      }
    } else {
      // Dev Fallback: Print token to console if BREVO_API_KEY is not set
      console.log("\n=======================================================");
      console.log("🔒 [DEV SIMULATION] BREVO_API_KEY not found in .env.local");
      console.log(`Reset Password URL for ${user.email}:`);
      console.log(resetUrl);
      console.log("=======================================================\n");
    }

    return NextResponse.json(
      { message: "If an account exists with this email, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
