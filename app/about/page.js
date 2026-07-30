"use client";

import React from "react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="min-h-[calc(100vh-64px)] text-white py-16 px-6 max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full">
          About GetMeAChai
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Empowering Creators, One Chai at a Time ☕
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          GetMeAChai is a direct-to-creator platform where fans can support their favorite artists, developers, and creators through micro-donations and memberships.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="rounded-2xl border border-slate-800 bg-[#121316] p-6 shadow-xl space-y-3">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
            🚀
          </div>
          <h3 className="text-xl font-bold text-white">Direct Support</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Receive support straight from your fans with zero hidden fees and fast payouts.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#121316] p-6 shadow-xl space-y-3">
          <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
            🔒
          </div>
          <h3 className="text-xl font-bold text-white">Secure Payments</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Integrated with Razorpay and Stripe to accept local and global payments seamlessly.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#121316] p-6 shadow-xl space-y-3">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">
            🌱
          </div>
          <h3 className="text-xl font-bold text-white">Creator Community</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Connect with an active audience who loves and funds your content.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-2xl border border-slate-800 bg-[#121316] p-10 text-center shadow-xl space-y-6">
        <h2 className="text-3xl font-bold text-white">Ready to start your journey?</h2>
        <p className="text-gray-400 max-w-lg mx-auto text-sm">
          Join thousands of creators who turn their passion into a sustainable career.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
          >
            Get Started
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 border border-slate-800 hover:bg-[#1c1e24] text-gray-300 font-semibold rounded-lg transition-all"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
