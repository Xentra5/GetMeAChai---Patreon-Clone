import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const providers = [];

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  );
}

providers.push(
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email and password are required");
      }

      await connectDB();

      const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
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
    },
  })
);

export const authOptions = {
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Auto-create / sync OAuth users in MongoDB if signing in with Google or GitHub
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email.toLowerCase() });
          if (!existingUser) {
            await User.create({
              name: user.name || "User",
              email: user.email.toLowerCase(),
              avatarUrl: user.image || "",
              password: crypto.randomBytes(16).toString("hex"), // Dummy random password for OAuth accounts
              role: "student",
            });
          }
        } catch (err) {
          console.error("Error creating OAuth user in DB:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id || token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
