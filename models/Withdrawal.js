import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema(
  {
    creator_email: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true }, // "Stripe Bank Transfer" or "PayPal"
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  },
  { timestamps: true }
);

// Safe Next.js Serverless Model Pattern
const Withdrawal = mongoose.models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);

export default Withdrawal;
