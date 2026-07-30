import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import connectDB from "@/db/connectDb"
import User from "@/models/user"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) {
          throw new Error("No user found with this email");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // Check if 2FA is active for this account
        if (user.is2FAEnabled) {
          if (!credentials.otp) {
            // Throw special signal that tells front-end to request the OTP
            throw new Error("2FA_REQUIRED");
          }

          // Verify OTP token
          const hashedOtp = crypto.createHash("sha256").update(credentials.otp).digest("hex");
          if (user.twoFactorToken !== hashedOtp || new Date() > user.twoFactorExpires) {
            throw new Error("Invalid or expired 2FA verification code");
          }

          // Clear token after successful usage
          user.twoFactorToken = null;
          user.twoFactorExpires = null;
          await user.save();
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
