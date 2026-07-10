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

if (mongoose.models && mongoose.models.Withdrawal) {
  delete mongoose.models.Withdrawal;
}
const Withdrawal = mongoose.model("Withdrawal", WithdrawalSchema);

export default Withdrawal;
