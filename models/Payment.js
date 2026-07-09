import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    to_username: { type: String, required: true },
    amount: { type: Number, required: true },
    message: { type: String },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.Payment) {
  delete mongoose.models.Payment;
}
const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
