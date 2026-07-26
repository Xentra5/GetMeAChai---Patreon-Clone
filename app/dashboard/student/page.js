"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Search,
  LogOut,
  MapPin,
  Coffee,
  Heart,
  BookOpen,
  Sparkles,
  ChevronRight,
  Compass,
  Lock,
  Grid3X3,
  LayoutList,
  ArrowUpRight,
  TrendingUp,
  Flame,
  Clock,
  RefreshCw,
  X,
} from "lucide-react";
import Sidebar from "@/Components/Sidebar";
import "../dashboard.css";
import "../../platform/platform.css";

// ─── Explore Category Tags ─────────────────────────────────────────────────
const CATEGORIES = ["All", "Design", "Engineering", "Writing", "Video"];

// ─── Relative time helper ─────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ─── Stable SVG avatar fallback ───────────────────────────────────────────
function avatarFallback(initial = "?") {
  const c = encodeURIComponent(initial.toUpperCase());
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="20" fill="%23292524"/><text x="20" y="26" font-size="16" font-family="sans-serif" text-anchor="middle" fill="%23d97706">${c}</text></svg>`;
}

// ─── Post Card Component ───────────────────────────────────────────────────
function PostCard({ post, viewMode, onViewCreator }) {
  const isGrid = viewMode === "grid";
  const initial = (post.creatorName || "C").charAt(0);

  return (
    <div
      style={{
        background: "#0f0f13",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
      }}
      className="student-post-card"
    >
      {/* Top: Creator Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isGrid ? "14px 16px 10px" : "16px 20px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={post.creatorAvatar || avatarFallback(initial)}
            onError={(e) => { e.target.src = avatarFallback(initial); }}
            style={{
              width: isGrid ? "32px" : "38px",
              height: isGrid ? "32px" : "38px",
              borderRadius: "50%",
              border: "2px solid rgba(217,119,6,0.4)",
              objectFit: "cover",
              flexShrink: 0,
            }}
            alt={post.creatorName}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: isGrid ? "0.8rem" : "0.9rem", color: "#fff", lineHeight: 1.2 }}>
              {post.creatorName}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#71717a" }}>
              @{(post.creatorHandle || post.creator_username).replace("@", "")}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: "999px",
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.25)",
              color: "#a78bfa",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {post.creatorCategory}
          </span>
          {post.isExclusive && (
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "999px",
                background: "rgba(217,119,6,0.12)",
                border: "1px solid rgba(217,119,6,0.3)",
                color: "#f59e0b",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Lock style={{ width: "9px", height: "9px" }} />
              Exclusive
            </span>
          )}
        </div>
      </div>

      {/* Middle: Post Content */}
      <div style={{ padding: isGrid ? "12px 16px" : "16px 20px", flex: 1 }}>
        <h3
          style={{
            fontSize: isGrid ? "0.88rem" : "1rem",
            fontWeight: 700,
            color: "#f4f4f5",
            marginBottom: "8px",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {post.title}
        </h3>

        {/* Content / Lock Overlay */}
        <div style={{ position: "relative" }}>
          <p
            style={{
              fontSize: isGrid ? "0.78rem" : "0.85rem",
              color: "#a1a1aa",
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: isGrid ? 3 : 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              filter: post.isExclusive ? "blur(3.5px)" : "none",
              userSelect: post.isExclusive ? "none" : "auto",
              marginBottom: 0,
            }}
          >
            {post.content}
          </p>
          {post.isExclusive && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                background: "rgba(9,9,11,0.55)",
                borderRadius: "8px",
                backdropFilter: "blur(1px)",
              }}
            >
              <Lock style={{ width: "18px", height: "18px", color: "#f59e0b" }} />
              <span style={{ fontSize: "0.75rem", color: "#f59e0b", fontWeight: 700 }}>
                Support to unlock
              </span>
              {post.minAmountRequired > 0 && (
                <span style={{ fontSize: "0.68rem", color: "#a1a1aa" }}>
                  Requires ₹{post.minAmountRequired}+ support
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isGrid ? "10px 16px" : "12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "#52525b", display: "flex", alignItems: "center", gap: "4px" }}>
          <Clock style={{ width: "11px", height: "11px" }} />
          {post.createdAt ? timeAgo(post.createdAt) : "Recently"}
        </span>
        <button
          onClick={() => onViewCreator(post.creator_username)}
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#d97706",
            background: "rgba(217,119,6,0.1)",
            border: "1px solid rgba(217,119,6,0.25)",
            borderRadius: "8px",
            padding: "5px 12px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "background 0.18s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(217,119,6,0.2)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(217,119,6,0.1)"}
        >
          View Profile <ArrowUpRight style={{ width: "12px", height: "12px" }} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Student Dashboard ────────────────────────────────────────────────
function StudentDashboardInner() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userRegion, setUserRegion] = useState("USA");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Explore state
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [sortMode, setSortMode] = useState("new"); // 'new' | 'trending'
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const PAGE_SIZE = 18;

  // Stats
  const [creators, setCreators] = useState([]);

  // Region
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userRegion");
      if (saved) setUserRegion(saved);
    }
  }, []);

  // Load wallet + creators count
  useEffect(() => {
    if (status !== "authenticated") return;
    async function loadMeta() {
      try {
        const [wRes, cRes] = await Promise.all([
          fetch("/api/user/settings"),
          fetch("/api/creators?sortBy=views"),
        ]);
        if (wRes.ok) { const d = await wRes.json(); setWalletBalance(d.walletBalance || 0); }
        if (cRes.ok) { const d = await cRes.json(); setCreators(d); }
      } catch {}
    }
    loadMeta();
  }, [status]);

  // Load explore posts
  const fetchPosts = useCallback(async (category, skip = 0, append = false) => {
    if (skip === 0) setLoadingPosts(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), skip: String(skip) });
      if (category && category !== "All") params.set("category", category);
      const res = await fetch(`/api/posts/explore?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => append ? [...prev, ...data.posts] : data.posts);
        setTotalPosts(data.total || 0);
      }
    } catch (e) {
      console.error("Explore fetch error:", e);
    } finally {
      setLoadingPosts(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchPosts(activeCategory, 0, false);
  }, [status, activeCategory, fetchPosts]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-medium">Loading Student Hub...</p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "Student";
  const userInitial = userName.charAt(0).toUpperCase();

  // Filter + sort locally (supplement server-side category filter)
  let filteredPosts = posts;
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredPosts = posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.creatorName?.toLowerCase().includes(q) ||
        p.creatorCategory?.toLowerCase().includes(q)
    );
  }
  if (sortMode === "trending") {
    // Put exclusive posts last (they need support); free content first
    filteredPosts = [...filteredPosts].sort((a, b) => (a.isExclusive ? 1 : 0) - (b.isExclusive ? 1 : 0));
  }

  const hasMore = posts.length < totalPosts && !searchQuery;

  const handleViewCreator = (slug) => {
    router.push(`/dashboard/platform?view=search`);
  };

  return (
    <div className="dashboard-body">
      <Sidebar activeTab="student" />

      <div className="main-wrapper">
        {/* ── Header ── */}
        <header className="header">
          {/* Search bar or trigger */}
          {showSearch ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, maxWidth: "480px" }}>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, creators, topics..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "8px 14px",
                  fontSize: "0.88rem",
                  color: "#f4f4f5",
                  outline: "none",
                }}
              />
              <button
                onClick={() => { setShowSearch(false); setSearchQuery(""); }}
                style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", padding: "4px" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>
          ) : (
            <button className="search-trigger" onClick={() => setShowSearch(true)}>
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search posts, creators, topics...
              </span>
              <span className="kbd">⌘K</span>
            </button>
          )}

          <div className="header-actions">
            {/* Region */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", padding: "4px 10px", borderRadius: "8px" }}>
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Region:</span>
              <select
                value={userRegion}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserRegion(val);
                  if (typeof window !== "undefined") localStorage.setItem("userRegion", val);
                }}
                style={{ background: "none", border: "none", color: "var(--text-main)", fontSize: "0.8rem", fontWeight: "600", cursor: "pointer", outline: "none" }}
              >
                <option value="USA" style={{ background: "#0a0a0a" }}>🇺🇸 United States (USD)</option>
                <option value="IND" style={{ background: "#0a0a0a" }}>🇮🇳 India (INR)</option>
              </select>
            </div>

            <button className="btn-export" onClick={() => router.push("/dashboard/wallet")}>
              <Coffee className="w-4 h-4 text-amber-400" />
              Wallet: {userRegion === "USA" ? "$" : "₹"}{walletBalance}
            </button>

            {/* Avatar + dropdown */}
            <div className="profile-container" style={{ position: "relative" }}>
              <button
                className="profile-trigger"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                <div className="avatar-letter" style={{ background: "linear-gradient(135deg, #d97706, #b45309)" }}>
                  {userInitial}
                </div>
              </button>
              {showProfileDropdown && (
                <>
                  <div
                    className="dropdown-backdrop"
                    onClick={() => setShowProfileDropdown(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 998 }}
                  />
                  <div className="profile-dropdown">
                    <div className="dropdown-user-info">
                      <span className="dropdown-username">{userName}</span>
                      <span className="dropdown-email">{session?.user?.email}</span>
                      <span className="text-[11px] text-amber-400 font-semibold mt-1 inline-block">🎓 Student Account</span>
                    </div>
                    <button
                      onClick={() => { setShowProfileDropdown(false); signOut(); }}
                      className="dropdown-item logout"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="content" style={{ padding: "2rem 2.5rem" }}>

          {/* Welcome Banner */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginBottom: "2rem",
            background: "linear-gradient(135deg, rgba(217,119,6,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(9,9,11,0.4) 100%)",
            border: "1px solid rgba(217,119,6,0.2)",
            borderRadius: "20px",
            padding: "24px 28px",
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "999px", background: "rgba(217,119,6,0.12)", border: "1px solid rgba(217,119,6,0.3)", color: "#f59e0b", fontSize: "0.75rem", fontWeight: 700, marginBottom: "10px" }}>
                  <Sparkles style={{ width: "13px", height: "13px" }} /> Student Hub
                </div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                  Hey, {userName}! 🍵
                </h1>
                <p style={{ fontSize: "0.875rem", color: "#a1a1aa", lineHeight: 1.6, maxWidth: "520px" }}>
                  Explore exclusive posts from verified creators — tutorials, project updates, design work, and more. Support creators you love to unlock exclusive content.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <Link href="/dashboard/platform?view=search" style={{ padding: "10px 20px", background: "#d97706", color: "#000", fontWeight: 700, fontSize: "0.85rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", transition: "background 0.2s" }}>
                  <Compass style={{ width: "15px", height: "15px" }} /> Find Creators
                </Link>
                <Link href="/dashboard/wallet" style={{ padding: "10px 20px", background: "rgba(255,255,255,0.06)", color: "#e4e4e7", fontWeight: 600, fontSize: "0.85rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.1)", transition: "background 0.2s" }}>
                  <Coffee style={{ width: "15px", height: "15px" }} /> Top Up
                </Link>
              </div>
            </div>

            {/* Stats bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { label: "Chai Balance", value: `${walletBalance} Chai`, icon: <Coffee style={{ width: "14px", height: "14px", color: "#f59e0b" }} />, sub: "Tokens available" },
                { label: "Verified Creators", value: `${creators.length}`, icon: <Heart style={{ width: "14px", height: "14px", color: "#fb7185" }} />, sub: "On the platform" },
                { label: "Explore Posts", value: `${totalPosts}`, icon: <BookOpen style={{ width: "14px", height: "14px", color: "#a78bfa" }} />, sub: "From all creators" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>{stat.value}</div>
                    <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{stat.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Explore Feed ── */}
          <div>
            {/* Feed Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Flame style={{ width: "18px", height: "18px", color: "#f59e0b" }} />
                  Explore Creator Posts
                </h2>
                <p style={{ fontSize: "0.78rem", color: "#71717a", marginTop: "2px" }}>
                  {totalPosts} posts from verified creators — scroll, discover, support
                </p>
              </div>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Sort */}
                <div style={{ display: "flex", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  {[
                    { key: "new", icon: <Clock style={{ width: "13px", height: "13px" }} />, label: "New" },
                    { key: "trending", icon: <TrendingUp style={{ width: "13px", height: "13px" }} />, label: "Trending" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSortMode(s.key)}
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: sortMode === s.key ? "rgba(217,119,6,0.2)" : "transparent",
                        color: sortMode === s.key ? "#f59e0b" : "#71717a",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div style={{ display: "flex", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  {[
                    { key: "grid", icon: <Grid3X3 style={{ width: "14px", height: "14px" }} /> },
                    { key: "list", icon: <LayoutList style={{ width: "14px", height: "14px" }} /> },
                  ].map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setViewMode(v.key)}
                      style={{
                        padding: "7px 11px",
                        background: viewMode === v.key ? "rgba(217,119,6,0.2)" : "transparent",
                        color: viewMode === v.key ? "#f59e0b" : "#71717a",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {v.icon}
                    </button>
                  ))}
                </div>

                {/* Refresh */}
                <button
                  onClick={() => fetchPosts(activeCategory, 0, false)}
                  style={{ padding: "7px 11px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#71717a", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                  title="Refresh feed"
                >
                  <RefreshCw style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px", marginBottom: "1.5rem", WebkitOverflowScrolling: "touch" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    background: activeCategory === cat ? "#d97706" : "rgba(255,255,255,0.04)",
                    color: activeCategory === cat ? "#000" : "#a1a1aa",
                    borderColor: activeCategory === cat ? "#d97706" : "rgba(255,255,255,0.09)",
                    boxShadow: activeCategory === cat ? "0 2px 16px rgba(217,119,6,0.3)" : "none",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Posts Grid / List */}
            {loadingPosts ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr",
                  gap: "16px",
                }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ height: viewMode === "grid" ? "220px" : "140px", borderRadius: "16px", background: "#121218", border: "1px solid rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite" }}
                  />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#52525b", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "16px", background: "rgba(255,255,255,0.02)" }}>
                <Compass style={{ width: "40px", height: "40px", margin: "0 auto 12px", opacity: 0.4 }} />
                <p style={{ fontSize: "1rem", fontWeight: 600, color: "#71717a", marginBottom: "4px" }}>
                  {searchQuery ? `No posts match "${searchQuery}"` : `No posts in ${activeCategory} yet`}
                </p>
                <p style={{ fontSize: "0.8rem" }}>Check back soon — creators are posting fresh content every day.</p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr",
                    gap: "16px",
                  }}
                >
                  {filteredPosts.map((post) => (
                    <PostCard
                      key={String(post._id)}
                      post={post}
                      viewMode={viewMode}
                      onViewCreator={handleViewCreator}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div style={{ textAlign: "center", marginTop: "2rem" }}>
                    <button
                      onClick={() => fetchPosts(activeCategory, posts.length, true)}
                      disabled={loadingMore}
                      style={{
                        padding: "12px 32px",
                        background: "rgba(217,119,6,0.1)",
                        border: "1px solid rgba(217,119,6,0.3)",
                        borderRadius: "12px",
                        color: "#f59e0b",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        cursor: loadingMore ? "not-allowed" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                        opacity: loadingMore ? 0.6 : 1,
                      }}
                    >
                      {loadingMore ? (
                        <><RefreshCw style={{ width: "15px", height: "15px", animation: "spin 1s linear infinite" }} /> Loading...</>
                      ) : (
                        <>Load More Posts <ChevronRight style={{ width: "15px", height: "15px" }} /></>
                      )}
                    </button>
                    <p style={{ fontSize: "0.75rem", color: "#52525b", marginTop: "8px" }}>
                      Showing {posts.length} of {totalPosts} posts
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Hover styles injected via style tag */}
      <style>{`
        .student-post-card:hover {
          transform: translateY(-3px);
          border-color: rgba(217,119,6,0.35) !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.45);
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading Student Hub...</p>
        </div>
      </div>
    }>
      <StudentDashboardInner />
    </Suspense>
  );
}
