"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function SignPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { score: 0, label: "", color: "text-gray-500", barColor: "bg-gray-700" };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        switch (score) {
            case 1:
                return { score: 1, label: "Very Weak", color: "text-red-500", barColor: "bg-red-500" };
            case 2:
                return { score: 2, label: "Weak", color: "text-orange-500", barColor: "bg-orange-500" };
            case 3:
                return { score: 3, label: "Medium", color: "text-yellow-500", barColor: "bg-yellow-500" };
            case 4:
                return { score: 4, label: "Strong", color: "text-green-500", barColor: "bg-green-500" };
            case 5:
                return { score: 5, label: "Very Strong", color: "text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]", barColor: "bg-emerald-400" };
            default:
                return { score: 0, label: "", color: "text-gray-500", barColor: "bg-gray-700" };
        }
    };

    const strength = getPasswordStrength(password);

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    return (
        <section className="min-h-[calc(100vh-64px)] flex items-center justify-center text-white py-12 px-4">
            <div className="w-full max-w-md">

                {/* Heading */}
                <h1 className="mb-2 text-center text-5xl font-bold font-serif">
                    Sign Up
                </h1>
                <p className="mb-8 text-center text-gray-400 text-sm">
                    Create your account to get started
                </p>

                {/* Card */}
                <div className="relative rounded-2xl border border-purple-500/20 bg-black/70 p-8 backdrop-blur-md shadow-[0_0_40px_rgba(139,92,246,0.1)]">

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* UserName */}
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-1.5 block text-sm font-medium text-white/70"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                type="username"
                                required
                                placeholder="Enter your Username "
                                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium text-white/70"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-white/70"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={8}
                                    maxLength={32}
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 pr-12 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xs select-none"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            
                            {password && password.length < 8 && (
                                <p className="mt-1.5 text-xs text-red-400">Password must be at least 8 characters (max 32).</p>
                            )}
                            
                            {/* Password Strength Indicator */}
                            {password && (
                                <div className="mt-2.5 text-xs">
                                    <div className="flex justify-between items-center mb-1 text-gray-400">
                                        <span>Password Strength</span>
                                        <span className={`font-semibold transition-colors duration-300 ${strength.color}`}>
                                            {strength.label}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 h-1.5 w-full">
                                        {[1, 2, 3, 4, 5].map((index) => (
                                            <div
                                                key={index}
                                                className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                                    index <= strength.score ? strength.barColor : "bg-white/10"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Confirm Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="Confirm Password"
                                    className="text-sm font-medium text-white/70"
                                >
                                    Confirm Password
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    id="Confirm Password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 pr-12 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-xs select-none"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20"
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
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg
                                    className="w-4 h-4 shrink-0"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.006 2a9.847 9.847 0 0 0-6.484 2.44 10.32 10.32 0 0 0-3.393 6.17 10.48 10.48 0 0 0 1.317 6.955 10.045 10.045 0 0 0 5.4 4.418c.504.095.683-.223.683-.494 0-.245-.01-1.052-.014-1.908-2.78.62-3.366-1.21-3.366-1.21a2.711 2.711 0 0 0-1.11-1.5c-.907-.637.07-.621.07-.621.317.044.62.163.885.346.266.183.487.426.647.71.135.253.318.476.538.655a2.079 2.079 0 0 0 2.37.196c.045-.52.27-1.006.635-1.37-2.219-.259-4.554-1.138-4.554-5.07a4.022 4.022 0 0 1 1.031-2.75 3.77 3.77 0 0 1 .096-2.713s.839-.275 2.749 1.05a9.26 9.26 0 0 1 5.004 0c1.906-1.325 2.74-1.05 2.74-1.05.37.858.406 1.828.101 2.713a4.017 4.017 0 0 1 1.029 2.75c0 3.939-2.339 4.805-4.564 5.058a2.471 2.471 0 0 1 .679 1.897c0 1.372-.012 2.477-.012 2.814 0 .272.18.592.687.492a10.05 10.05 0 0 0 5.388-4.421 10.473 10.473 0 0 0 1.313-6.948 10.32 10.32 0 0 0-3.39-6.165A9.847 9.847 0 0 0 12.007 2Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                GitHub
                            </button>

                            {/* Google */}
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg
                                    className="w-4 h-4 shrink-0"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.037 21.998a10.313 10.313 0 0 1-7.168-3.049 9.888 9.888 0 0 1-2.868-7.118 9.947 9.947 0 0 1 3.064-6.949A10.37 10.37 0 0 1 12.212 2h.176a9.935 9.935 0 0 1 6.614 2.564L16.457 6.88a6.187 6.187 0 0 0-4.131-1.566 6.9 6.9 0 0 0-4.794 1.913 6.618 6.618 0 0 0-2.045 4.657 6.608 6.608 0 0 0 1.882 4.723 6.891 6.891 0 0 0 4.725 2.07h.143c1.41.072 2.8-.354 3.917-1.2a5.77 5.77 0 0 0 2.172-3.41l.043-.117H12.22v-3.41h9.678c.075.617.109 1.238.1 1.859-.099 5.741-4.017 9.6-9.746 9.6l-.215-.002Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Google
                            </button>
                        </div>

                        {/* Login Link */}
                        <p className="text-center text-sm text-gray-400 pt-1">
                            Already have an account?{" "}
                            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-colors">
                                Login
                            </Link>
                        </p>

                    </form>
                </div>

            </div>
        </section>
    );
}