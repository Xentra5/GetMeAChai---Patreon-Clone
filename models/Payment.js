import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    to_username: { type: String, required: true },
    amount: { type: Number, required: true },
    message: { type: String },
    from_email: { type: String, default: "" },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
  },
  { timestamps: true }
);

// Safe Next.js Serverless Model Pattern
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
