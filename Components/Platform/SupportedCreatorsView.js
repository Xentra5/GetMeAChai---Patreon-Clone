"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, ArrowUpRight, Coffee, Sparkles } from "lucide-react";
import "../../app/platform/platform.css";

export default function SupportedCreatorsView({ onSelectProfile }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadSupportedCreators() {
      setLoading(true);
      try {
        const response = await fetch("/api/creators?sortBy=views");
        if (response.ok) {
          const data = await response.json();
          setCreators(data);
        }
      } catch (error) {
        console.error("Error loading supported creators:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSupportedCreators();
  }, []);

  if (loading) {
    return (
      <div className="platform-view-section">
        <h1 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "2rem" }}>
          My Supported Creators
        </h1>
        <div className="platform-creator-grid">
          {[1, 2].map((n) => (
            <div key={n} className="platform-card platform-shimmer-card">
              <div className="platform-shimmer-item" style={{ height: "40px", width: "40px", borderRadius: "50%", marginBottom: "1rem" }} />
              <div className="platform-shimmer-item" style={{ height: "18px", width: "70%", marginBottom: "0.5rem" }} />
              <div className="platform-shimmer-item" style={{ height: "30px", width: "100%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Display top creators as supported list
  const supportedList = creators.slice(0, 3);

  return (
    <div className="platform-view-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5" /> Active Memberships & Support
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            My Supported Creators
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Creators you actively support with Chai tokens and recurring memberships.
          </p>
        </div>
      </div>

      {supportedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportedList.map((creator, index) => {
            const creatorName = creator.name || creator.email.split("@")[0];
            const handle = creator.twitterHandle || creator.githubHandle || creatorName.toLowerCase().replace(/\s+/g, "");
            const tierNames = ["🥇 Gold Supporter", "🥈 Silver Supporter", "🥉 Bronze Supporter"];
            const tierName = tierNames[index % tierNames.length];

            return (
              <div
                key={creator._id}
                className="bg-[#121318] border border-zinc-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                      {tierName}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                      <Coffee className="w-3.5 h-3.5 text-amber-400" /> Active
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={creator.avatarUrl || "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"%23d97706\"><path d=\"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\"/></svg>"}
                      className="w-14 h-14 rounded-full border-2 border-amber-500/40 object-cover"
                      alt={creatorName}
                    />
                    <div>
                      <h3 className="font-bold text-white text-lg">{creatorName}</h3>
                      <p className="text-zinc-400 text-xs">@{handle.replace('@', '')}</p>
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block mt-1">
                        {creator.category || "Engineering"}
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2 mb-5">
                    {creator.bio || "Sharing updates, tutorials, and digital content on GetMeAChai."}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-zinc-800/80">
                  <button
                    onClick={() => onSelectProfile ? onSelectProfile(creator) : router.push(`/dashboard/platform?view=profile`)}
                    className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    View Profile <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/platform?view=dms")}
                    className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs rounded-xl transition-all flex items-center gap-1"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-zinc-500 text-sm bg-zinc-950/40 border border-zinc-900 rounded-2xl">
          You haven&apos;t supported any creators yet. Explore creators to start supporting!
        </div>
      )}
    </div>
  );
}
