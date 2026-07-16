"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import tea from "../images/tea.png";
import supportImg from "../images/support.png";
import doller from "../images/doller.png";
import profile from "../images/profile.png";

export default function Home() {
  const [username, setUsername] = useState("");
  const [selectedChais, setSelectedChais] = useState(3);
  const [claimed, setClaimed] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    creatorsCount: 0,
    totalEarnings: 0,
    chaisBought: 0,
    supportersCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/landing-stats");
        if (res.ok) {
          const data = await res.json();
          setGlobalStats(data);
        }
      } catch (err) {
        console.error("Error loading landing stats:", err);
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleClaim = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setClaimed(true);
      setTimeout(() => {
        window.location.href = `/signup?username=${encodeURIComponent(username.trim().toLowerCase())}`;
      }, 800);
    }
  };

  return (
    <div className="text-white min-h-screen">
      
      {/* ── HERO SECTION (Split Layout) ── */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Context & Interactive Claim Input */}
        <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left anim-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 bg-[#121316] text-gray-300 text-xs font-semibold w-fit mx-auto lg:mx-0 mb-6">
            🎉 A 100% direct-to-creator platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Fund your creative journey, <br className="hidden md:inline" />
            one <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Chai</span> at a time.
          </h1>

          <p className="mt-6 text-gray-400 text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Get supported directly by your fans in real time. No hidden platform cuts, no payout delays—just simple, genuine support from the audience who loves your work.
          </p>

          {/* Claim Username Input */}
          <form onSubmit={handleClaim} className="mt-8 max-w-lg mx-auto lg:mx-0">
            <div className="relative flex items-center p-1.5 rounded-2xl border border-slate-800 bg-[#121316] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
              <span className="pl-4 text-gray-500 text-sm font-semibold select-none">
                getmeachai.com/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                placeholder="username"
                disabled={claimed}
                className="flex-1 bg-transparent px-2 py-3 text-white placeholder-gray-600 outline-none text-sm font-semibold disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={claimed}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 shadow-lg shadow-blue-500/10 flex items-center gap-2"
              >
                {claimed ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Claimed...
                  </>
                ) : (
                  "Claim Page"
                )}
              </button>
            </div>
            <p className="mt-2.5 text-left text-xs text-gray-500 pl-2">
              Free to set up. Takes less than 2 minutes.
            </p>
          </form>
        </div>

        {/* Right Column: High-Fidelity Creator Card Mockup */}
        <div className="lg:col-span-5 flex justify-center items-center anim-fade-up anim-delay-1 select-none">
          <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-[#121316] p-5 shadow-lg relative overflow-hidden backdrop-blur-md">
            
            {/* Mock Profile Card Cover Banner */}
            <div className="h-24 w-full rounded-2xl bg-slate-800 relative overflow-hidden border border-white/5">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/40 text-[10px] border border-white/10 tracking-widest uppercase font-mono text-blue-400">
                LIVE PREVIEW
              </div>
            </div>

            {/* Avatar & Info */}
            <div className="relative px-3 -mt-10 flex flex-col items-center text-center">
              <img
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
                alt="Aditya"
                className="w-20 h-20 rounded-full border-4 border-[#121316] object-cover ring-2 ring-blue-500/30"
              />
              <h2 className="mt-2 text-lg font-bold text-white flex items-center gap-1.5">
                Aditya Verma
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              </h2>
              <p className="text-xs text-blue-400/80 font-medium">Building open-source Next.js frameworks</p>
            </div>

            {/* Progress Goal */}
            <div className="mt-5 px-1">
              <div className="flex justify-between text-[11px] font-semibold text-gray-400 mb-1">
                <span>Goal: Upgrading audio gear</span>
                <span className="text-blue-400">80% funded</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden border border-white/5">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: "80%" }} />
              </div>
            </div>

            {/* Chai Purchase Section */}
            <div className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Buy Aditya a Chai
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 3, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSelectedChais(val)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                      selectedChais === val
                        ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : "bg-black/30 border-white/5 text-gray-400 hover:border-blue-500/30"
                    }`}
                  >
                    ☕ {val} Chai{val > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
              
              <button 
                type="button"
                className="mt-4 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Send ₹{selectedChais * 100} Support
              </button>
            </div>

            {/* Feed Scroll */}
            <div className="mt-4 space-y-2">
              <div className="flex gap-2.5 items-start p-2 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="w-6 h-6 rounded-full bg-blue-900/40 border border-white/10 flex items-center justify-center text-[10px] font-bold text-blue-300">S</div>
                <div className="flex-1 text-[11px]">
                  <p className="font-semibold text-gray-300">Sam <span className="text-[9px] text-gray-500 font-normal">bought 3 Chais</span></p>
                  <p className="text-gray-400 mt-0.5">Thanks for the Next.js router setup!</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ── KEY STATS DASHBOARD (Live Database Statistics) ── */}
      <section className="max-w-7xl mx-auto px-6 py-8 anim-fade-up">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="border border-slate-800 bg-[#121316]/60 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-blue-400">
              {statsLoading ? "..." : globalStats.creatorsCount.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">
              🚀 Creators Empowered
            </span>
          </div>

          <div className="border border-slate-800 bg-[#121316]/60 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-indigo-400">
              {statsLoading ? "..." : globalStats.chaisBought.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">
              ☕ Chais Bought
            </span>
          </div>

          <div className="border border-slate-800 bg-[#121316]/60 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-purple-400">
              {statsLoading ? "..." : globalStats.supportersCount.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">
              👥 Supporters Worldwide
            </span>
          </div>

          <div className="border border-slate-800 bg-[#121316]/60 backdrop-blur-md p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-emerald-400">
              ₹{statsLoading ? "..." : globalStats.totalEarnings.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-2">
              💰 Earnings Generated
            </span>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: How It Works & Transparency ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-16" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Visual Highlight Block */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              
              <div className="border border-slate-800 bg-[#121316] p-6 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-500/20 flex items-center justify-center text-xl">
                  💎
                </div>
                <h3 className="text-lg font-bold text-blue-400">0% Platform Fee</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  We don't take a cut of your hard work. 100% of the support sent by your fans lands directly in your payout account.
                </p>
              </div>

              <div className="border border-slate-800 bg-[#121316] p-6 rounded-2xl flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900/40 border border-blue-500/20 flex items-center justify-center text-xl">
                  ⚡
                </div>
                <h3 className="text-lg font-bold text-blue-400">Real-time Payouts</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  No monthly holds or minimum payout thresholds. When someone buys you a Chai, the funds are deposited instantly.
                </p>
              </div>

            </div>
          </div>

          {/* Context Highlight Text */}
          <div className="order-1 lg:order-2 flex flex-col justify-center text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              A transparent path to support. <br />
              No middle-men.
            </h2>
            <p className="mt-4 text-gray-400 text-base leading-relaxed">
              Traditional crowdfunding platforms charge heavy percentage cuts and hold your earnings for weeks. GetMeAChai resolves this by transferring payouts directly, ensuring you keep every single rupee you make.
            </p>
            <div className="mt-6 flex justify-center lg:justify-start">
              <Link href="/signup" className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer">
                Learn more about our system
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 3: Step-by-Step Flow ── */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-16" />

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Start receiving support in 3 simple steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="border border-slate-800/80 border-t-2 border-t-amber-600 bg-[#121316] rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 text-4xl font-extrabold font-mono text-amber-500/10 select-none">01</div>
            <h3 className="text-lg font-bold text-white mb-2">Claim your page</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Choose your profile link, hook up your email, and write a small message for your fans.
            </p>
          </div>

          <div className="border border-slate-800/80 border-t-2 border-t-blue-600 bg-[#121316] rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 text-4xl font-extrabold font-mono text-blue-500/10 select-none">02</div>
            <h3 className="text-lg font-bold text-white mb-2">Configure payouts</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect your payment details in minutes to receive instant direct bank deposits.
            </p>
          </div>

          <div className="border border-slate-800/80 border-t-2 border-t-purple-600 bg-[#121316] rounded-2xl p-6 relative">
            <div className="absolute top-4 right-4 text-4xl font-extrabold font-mono text-purple-500/10 select-none">03</div>
            <h3 className="text-lg font-bold text-white mb-2">Share with your fans</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Drop your custom GetMeAChai link in your bios, video descriptions, or blog posts.
            </p>
          </div>

        </div>
      </section>

      {/* ── SECTION 4: Real Featured Creators Directory ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-16" />

        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Empowering independent creators
        </h2>
        <p className="text-center text-gray-400 text-sm max-w-md mx-auto mb-12">
          Discover creators building tools, publishing essays, and teaching code on their own terms.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "CodeWithRahul", bio: "Creating free React & Node tutorials on YouTube", chais: "2,453", goal: "Upgrading editing PC", progress: 85, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" },
            { name: "ArtByPriya", bio: "Painting abstract Indian folklore digital designs", chais: "1,892", goal: "Buying drawing tablet", progress: 62, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
            { name: "WriteWithArjun", bio: "Publishing weekly essays on indie hacking & tech", chais: "1,205", goal: "Publishing physical book", progress: 40, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" },
            { name: "TechWithNeha", bio: "Teaching Rust programming from scratch", chais: "2,112", goal: "Buying a podcast mic", progress: 95, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80" },
          ].map((creator, i) => (
            <div key={i} className="bg-[#121316] border border-slate-800/80 rounded-2xl p-5 group hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 transition-transform duration-300 group-hover:scale-105"
                  />
                  <div>
                    <h3 className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">{creator.name}</h3>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 block w-fit mt-0.5">
                      ☕ {creator.chais} support
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-xs mt-4 leading-relaxed line-clamp-2">
                  {creator.bio}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[9px] text-gray-500 font-semibold mb-1">
                    <span className="truncate max-w-[120px]">{creator.goal}</span>
                    <span>{creator.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${creator.progress}%` }} />
                  </div>
                </div>
              </div>

              <Link
                href={`/signup?creator=${encodeURIComponent(creator.name)}`}
                className="mt-5 w-full py-2 bg-blue-950/20 border border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-600 text-white rounded-xl text-xs font-bold text-center block transition-all duration-200 cursor-pointer"
              >
                Support Creator
              </Link>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
