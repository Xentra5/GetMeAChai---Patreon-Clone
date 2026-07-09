import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
        },
        role: {
            type: String,
            default: "student",
            enum: ["student", "creator"],
        },
        monthlyGoal: {
            type: Number,
            default: 50000,
        },
        profileViews: {
            type: Number,
            default: 0, // Default to 0 views for new user accounts
        },
        avatarUrl: {
            type: String,
            default: "https://i.pravatar.cc/100?img=11",
        },
        twitterHandle: {
            type: String,
            default: "",
        },
        githubHandle: {
            type: String,
            default: "",
        },
    },
    { timestamps: true } // Automatically creates createdAt and updatedAt fields
);

// Delete cached model in Next.js development to force fresh compilation with updated schema fields
if (mongoose.models && mongoose.models.User) {
  delete mongoose.models.User;
}
const User = mongoose.model("User", UserSchema);

export default User;
