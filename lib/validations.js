import { z } from "zod";

export const supportSchema = z.object({
  name: z.string().trim().max(100, "Name cannot exceed 100 characters").optional().default("Anonymous Supporter"),
  to_username: z.string().min(1, "Target creator username is required").transform((val) => val.toLowerCase().trim().replace(/\s+/g, "")),
  amount: z.number().positive("Amount must be greater than 0"),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional().default(""),
  paymentMethod: z.enum(["Wallet", "Razorpay"]).optional().default("Wallet"),
});

export const userSettingsSchema = z.object({
  name: z.string().max(100).optional(),
  monthlyGoal: z.number().nonnegative("Goal must be non-negative").optional(),
  twitterHandle: z.string().max(50).optional(),
  githubHandle: z.string().max(50).optional(),
  category: z.enum(["Design", "Engineering", "Writing", "Video"]).optional(),
  supportToken: z.string().max(20).optional(),
  bronzePrice: z.number().nonnegative().optional(),
  silverPrice: z.number().nonnegative().optional(),
  goldPrice: z.number().nonnegative().optional(),
});
