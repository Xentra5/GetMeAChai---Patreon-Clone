import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["deposit", "payment", "withdrawal"], required: true },
    status: { type: String, enum: ["pending", "success", "failed"], default: "success" },
    description: { type: String, required: true },
    paymentMethod: { type: String, default: "Card" },
  },
  { timestamps: true }
);

// Safe Next.js Serverless Model Pattern
const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model("WalletTransaction", WalletTransactionSchema);

export default WalletTransaction;
