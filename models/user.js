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
    },
    { timestamps: true } // Automatically creates createdAt and updatedAt fields
);

// This checks if the model already exists in mongoose to prevent recompiling it
const User = mongoose.models && mongoose.models.User && typeof mongoose.models.User === "function"
  ? mongoose.models.User
  : mongoose.model("User", UserSchema);

export default User;
