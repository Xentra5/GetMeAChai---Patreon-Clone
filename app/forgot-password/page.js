"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter your email or phone number.");
      return;
    }

    setLoading(true);

    try {
      // Demo simulation for reset request
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
    } catch (err) {
      setError("Failed to send reset link. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-64px)] flex items-center justify-center text-white py-12 px-4">
      <div className="w-full max-w-md">

        {/* Heading */}
        <h1 className="mb-2 text-center text-4xl font-extrabold text-white">
          Reset Password
        </h1>
        <p className="mb-8 text-center text-gray-400 text-sm">
          Enter your email address or phone number to recover your account.
        </p>

        {/* Card */}
        <div className="relative rounded-2xl border border-slate-800 bg-[#121316] p-8 shadow-xl">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h2 className="text-xl font-bold text-white">Check Your Inbox / Messages</h2>
              <p className="text-sm text-gray-400">
                If an account exists for <span className="text-white font-medium">{identifier}</span>, we have sent instructions to reset your password.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-gray-400 hover:text-white underline transition-colors"
                >
                  Try another email or phone number
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* Email / Phone input */}
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-1.5 block text-sm font-medium text-white/70"
                >
                  Email address or Phone number
                </label>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or +1234567890"
                  className="w-full rounded-lg border border-slate-800 bg-[#090a0f] px-4 py-3 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending instructions..." : "Send Reset Link / OTP"}
              </button>

              {/* Back to Login Link */}
              <p className="text-center text-sm text-gray-400 pt-2">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors"
                >
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
