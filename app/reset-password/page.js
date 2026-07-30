"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-[#121316] p-8 shadow-xl">
      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white">Password Reset Successful!</h2>
          <p className="text-sm text-gray-400">
            Your password has been updated. Redirecting you to the login page...
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block px-4 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-white/70">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-800 bg-[#090a0f] px-4 py-3 pr-12 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xs select-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-white/70">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-800 bg-[#090a0f] px-4 py-3 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Updating Password..." : "Set New Password"}
          </button>

          {/* Back to Login */}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <section className="min-h-[calc(100vh-64px)] flex items-center justify-center text-white py-12 px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-center text-4xl font-extrabold text-white">
          Create New Password
        </h1>
        <p className="mb-8 text-center text-gray-400 text-sm">
          Please enter your new password below.
        </p>
        <Suspense fallback={<div className="text-center text-gray-400 py-10">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </section>
  );
}
