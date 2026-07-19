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

if (mongoose.models && mongoose.models.WalletTransaction) {
  delete mongoose.models.WalletTransaction;
}
const WalletTransaction = mongoose.model("WalletTransaction", WalletTransactionSchema);

export default WalletTransaction;
