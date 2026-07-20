import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    senderEmail: { type: String, required: true },
    senderName: { type: String, required: true },
    receiverUsername: { type: String, required: true },
    supporterEmail: { type: String, required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.Message) {
  delete mongoose.models.Message;
}
const Message = mongoose.model("Message", MessageSchema);

export default Message;
