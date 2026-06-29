import { NextResponse } from "next/server";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // 1. Connect to the database
    await connectDB();

    // 2. Parse the body JSON
    const { email, password, name } = await request.json();

    // Validation checks
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // 3. Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create the user in the database
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // Store the secure hashed password
    });

    // Return success response (omitting password for security)
    return NextResponse.json(
      { 
        message: "User registered successfully", 
        user: { id: newUser._id, email: newUser.email, name: newUser.name } 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred" },
      { status: 500 }
    );
  }
}
