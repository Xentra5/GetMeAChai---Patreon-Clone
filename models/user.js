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
        walletBalance: {
            type: Number,
            default: 0,
        },
        category: {
            type: String,
            default: "Engineering",
            enum: ["Design", "Engineering", "Writing", "Video"],
        },
        profileViews: {
            type: Number,
            default: 0, // Default to 0 views for new user accounts
        },
        avatarUrl: {
            type: String,
            default: "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%23a855f7\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\"/></svg>",
        },
        coverUrl: {
            type: String,
            default: "",
        },
        twitterHandle: {
            type: String,
            default: "",
        },
        githubHandle: {
            type: String,
            default: "",
        },
        supportToken: {
            type: String,
            default: "Chai",
        },
        bronzePrice: {
            type: Number,
            default: 100,
        },
        silverPrice: {
            type: Number,
            default: 500,
        },
        goldPrice: {
            type: Number,
            default: 1000,
        },
        payoutScheduleFrequency: {
            type: String,
            default: "Every Friday",
        },
        payoutNextDate: {
            type: String,
            default: "Friday, Oct 25",
        },
        payoutProcessingTime: {
            type: String,
            default: "1-2 business days",
        },
        payoutMinimumThreshold: {
            type: Number,
            default: 1000,
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
