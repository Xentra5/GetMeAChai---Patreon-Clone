import mongoose from "mongoose";

const PayoutMethodSchema = new mongoose.Schema(
  {
    creator_email: { type: String, required: true },
    type: { type: String, enum: ["national", "international"], required: true },
    methodType: { type: String, required: true }, // "bank", "upi", "paypal", "stripe", "crypto"
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.PayoutMethod) {
  delete mongoose.models.PayoutMethod;
}
const PayoutMethod = mongoose.model("PayoutMethod", PayoutMethodSchema);

export default PayoutMethod;
