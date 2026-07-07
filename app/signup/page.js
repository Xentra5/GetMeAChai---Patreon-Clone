"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

// Eye icon SVGs for show/hide toggle
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "#6b7280", barColor: "#374151" };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
        case 1: return { score: 1, label: "Very Weak", color: "#ef4444", barColor: "#ef4444" };
        case 2: return { score: 2, label: "Weak", color: "#f97316", barColor: "#f97316" };
        case 3: return { score: 3, label: "Medium", color: "#eab308", barColor: "#eab308" };
        case 4: return { score: 4, label: "Strong", color: "#22c55e", barColor: "#22c55e" };
        case 5: return { score: 5, label: "Very Strong", color: "#34d399", barColor: "#34d399" };
        default: return { score: 0, label: "", color: "#6b7280", barColor: "#374151" };
    }
};

export default function SignPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");

    const strength = getPasswordStrength(password);

    // Does the confirm field match (only show mismatch if user has typed something)
    const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            // Auto-login the user so NextAuth creates a session
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Signup succeeded, but automatic login failed: " + result.error);
                return;
            }

            window.location.href = "/select-role";

        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error(err);
        }
    };

    const inputClass =
        "w-full rounded-lg border border-slate-800 bg-[#090a0f] px-4 py-3 pr-12 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

    return (
        <section className="min-h-[calc(100vh-64px)] flex items-center justify-center text-white py-12 px-4">
            <div className="w-full max-w-md">

                {/* Heading */}
                <h1 className="mb-2 text-center text-4xl font-extrabold text-white">Sign Up</h1>
                <p className="mb-8 text-center text-gray-400 text-sm">
                    Create your account to get started
                </p>

                {/* Card */}
                <div className="relative rounded-2xl border border-slate-800 bg-[#121316] p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Error banner */}
                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-white/70">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="w-full rounded-lg border border-slate-800 bg-[#090a0f] px-4 py-3 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-slate-800 bg-[#090a0f] px-4 py-3 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* ── Password ── */}
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/70">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    maxLength={32}
                                    placeholder="Enter password"
                                    className={inputClass}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>

                            {/* Min-length warning */}
                            {password.length > 0 && password.length < 8 && (
                                <p className="mt-1.5 text-xs text-red-400">
                                    Password must be at least 8 characters (max 32).
                                </p>
                            )}

                            {/* Strength indicator — only when typing */}
                            {password.length > 0 && (
                                <div className="mt-2.5">
                                    <div className="flex justify-between items-center mb-1 text-xs text-gray-400">
                                        <span>Password Strength</span>
                                        <span
                                            className="font-semibold"
                                            style={{ color: strength.color }}
                                        >
                                            {strength.label}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 h-1.5 w-full">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i}
                                                className="h-full flex-1 rounded-full transition-all duration-300"
                                                style={{
                                                    backgroundColor:
                                                        i <= strength.score
                                                            ? strength.barColor
                                                            : "rgba(255,255,255,0.1)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Confirm Password ── */}
                        <div>
                            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-white/70">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password"
                                    className={`${inputClass} ${confirmMismatch ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/30" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                                >
                                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {confirmMismatch && (
                                <p className="mt-1.5 text-xs text-red-400">Passwords do not match.</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/10"
                        >
                            Sign Up
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center gap-3">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-xs text-gray-500">or continue with</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* GitHub */}
                            <button
                                onClick={() => signIn("github")}
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z" clipRule="evenodd" />
                                </svg>
                                GitHub
                            </button>

                            {/* Google */}
                            <button
                                onClick={() => signIn("google")}
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12.037 21.998a10.313 10.313 0 0 1-7.168-3.049 9.888 9.888 0 0 1-2.868-7.118 9.947 9.947 0 0 1 3.064-6.949A10.37 10.37 0 0 1 12.212 2h.176a9.935 9.935 0 0 1 6.614 2.564L16.457 6.88a6.187 6.187 0 0 0-4.131-1.566 6.9 6.9 0 0 0-4.794 1.913 6.618 6.618 0 0 0-2.045 4.657 6.608 6.608 0 0 0 1.882 4.723 6.891 6.891 0 0 0 4.725 2.07h.143c1.41.072 2.8-.354 3.917-1.2a5.77 5.77 0 0 0 2.172-3.41l.043-.117H12.22v-3.41h9.678c.075.617.109 1.238.1 1.859-.099 5.741-4.017 9.6-9.746 9.6l-.215-.002Z" clipRule="evenodd" />
                                </svg>
                                Google
                            </button>
                        </div>

                        {/* Login link */}
                        <p className="text-center text-sm text-gray-400 pt-1">
                            Already have an account?{" "}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">
                                Login
                            </Link>
                        </p>

                    </form>
                </div>

            </div>
        </section>
    );
}
