import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    creator_username: { type: String, required: true },
    minAmountRequired: { type: Number, default: 0 },
    rewardName: { type: String, default: "" },
    rewardUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

// Safe Next.js Serverless Model Pattern
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

export default Post;
