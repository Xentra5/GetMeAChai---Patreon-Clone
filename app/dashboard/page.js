"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Chart, registerables } from "chart.js";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Search,
  Download,
  Sparkles,
  ChevronRight,
  Pencil,
  LogOut,
  Compass,
  User,
  Settings,
  Wallet,
  MapPin
} from "lucide-react";
import "./dashboard.css";

// Register Chart.js modules
Chart.register(...registerables);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // API stats data state
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Region & Localisation State: "USA" (USD) or "IND" (INR)
  const [userRegion, setUserRegion] = useState("USA");
  const usdToInrRate = 83.5;

  // Load region from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userRegion");
      if (saved) {
        setUserRegion(saved);
      }
    }
  }, []);

  // States for animated counters
  const [revenue, setRevenue] = useState(0);
  const [goalPerc, setGoalPerc] = useState(0);
  const [views, setViews] = useState(0);
  const [goalWidth, setGoalWidth] = useState("0%");

  // Dashboard Settings Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newGoal, setNewGoal] = useState("");

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleSaveSettings = async () => {
    if (isNaN(Number(newGoal)) || Number(newGoal) < 0) {
      alert("Goal amount must be a positive number.");
      return;
    }
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthlyGoal: Number(newGoal)
        }),
      });
      if (res.ok) {
        // Re-fetch all dashboard stats so every derived field (goalStatusText,
        // revenueChangeText, goalPercentage, etc.) is recalculated server-side.
        const statsRes = await fetch("/api/dashboard/stats");
        if (statsRes.ok) {
          const freshStats = await statsRes.json();
          setStats(freshStats);
        }
        setIsSettingsOpen(false);
      } else {
        alert("Failed to save settings.");
      }
    } catch (e) {
      console.error(e);
      alert("Error saving settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch dashboard stats from API
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error("Failed to fetch dashboard stats");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [status]);

  // Animate numbers helper
  const animateValue = (setValue, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOut * (end - start) + start);

      setValue(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };
    window.requestAnimationFrame(step);
  };

  // Trigger counters and progress bar animation once stats are loaded
  useEffect(() => {
    if (!stats) return;

    // Reset values first
    setRevenue(0);
    setGoalPerc(0);
    setViews(0);

    const isUSD = userRegion === "USA";
    const targetRevenue = isUSD ? Math.floor(stats.revenue / usdToInrRate) : stats.revenue;

    // Animate stats numbers
    animateValue(setRevenue, 0, targetRevenue, 1500);
    animateValue(setGoalPerc, 0, stats.goalPercentage, 1500);
    animateValue(setViews, 0, stats.profileViews, 1500);

    // Animate goal bar progress
    const timer = setTimeout(() => {
      setGoalWidth(`${stats.goalPercentage}%`);
    }, 300);

    return () => clearTimeout(timer);
  }, [stats, userRegion]);

  // Chart initialization
  useEffect(() => {
    if (!stats || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
    gradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

    // Destroy existing chart to prevent canvas reuse issues
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const isUSD = userRegion === "USA";
    const convertedActualWeeks = isUSD
      ? stats.actualRevenueWeeks.map((v) => (v !== null ? Math.round(v / usdToInrRate) : null))
      : stats.actualRevenueWeeks;
    const convertedTargetWeeks = isUSD
      ? stats.goalTargetWeeks.map((v) => (v !== null ? Math.round(v / usdToInrRate) : null))
      : stats.goalTargetWeeks;
    const convertedProjectionWeek = isUSD
      ? Math.round(stats.projectionWeek / usdToInrRate)
      : stats.projectionWeek;

    // Connect weeks projection from last actual point
    const projectionData = [
      null,
      null,
      null,
      convertedActualWeeks[3],
      convertedProjectionWeek
    ];

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Projected"],
        datasets: [
          {
            label: "Actual Revenue",
            data: convertedActualWeeks,
            borderColor: "#10b981",
            backgroundColor: gradient,
            borderWidth: 2,
            pointBackgroundColor: "#000",
            pointBorderColor: "#10b981",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Goal Target",
            data: convertedTargetWeeks,
            borderColor: "#71717a",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
            tension: 0,
          },
          {
            label: "Projection",
            data: projectionData,
            borderColor: "#10b981",
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: "#10b981",
            pointRadius: 4,
            fill: false,
            tension: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "#121212",
            titleColor: "#ededed",
            bodyColor: "#a1a1aa",
            borderColor: "rgba(255,255,255,0.15)",
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (context) {
                let val = (isUSD ? "$" : "₹") + context.parsed.y.toLocaleString(isUSD ? "en-US" : "en-IN");
                return context.dataset.label + ": " + val;
              },
              afterBody: function (context) {
                if (context[0] && context[1] && context[0].parsed.y) {
                  let actual = context[0].parsed.y;
                  let goal = context[1].parsed.y;
                  let diff = actual - goal;
                  let prefix = diff >= 0 ? "+" : "";
                  return (
                    "\nDifference: " +
                    prefix +
                    (isUSD ? "$" : "₹") +
                    diff.toLocaleString(isUSD ? "en-US" : "en-IN")
                  );
                }
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#71717a", font: { family: "Inter" } },
          },
          y: {
            grid: { color: "rgba(255,255,255,0.03)" },
            ticks: {
              color: "#71717a",
              font: { family: "Inter" },
              callback: (val) => (isUSD ? "$" : "₹") + (isUSD ? val : val / 1000 + "k"),
            },
          },
        },
        interaction: { mode: "nearest", axis: "x", intersect: false },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [stats, userRegion]);

  // Loading indicator for session validation
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Synchronizing secure data system...</p>
        </div>
      </div>
    );
  }

  // Fallback check if auth logic fails
  if (!stats) return null;

  // Extract stats values with safe default fallbacks
  const isUSD = userRegion === "USA";
  const goalProgressVal = isUSD ? Math.floor((stats?.goalProgress ?? 0) / usdToInrRate) : (stats?.goalProgress ?? 0);
  const monthlyGoalVal = isUSD ? Math.floor((stats?.monthlyGoal ?? 0) / usdToInrRate) : (stats?.monthlyGoal ?? 0);
  const projectedOverageVal = isUSD ? Math.floor((stats?.projectedOverage ?? 0) / usdToInrRate) : (stats?.projectedOverage ?? 0);
  const goalRemaining = monthlyGoalVal - goalProgressVal;

  return (
    <div className="dashboard-body">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span>▲</span> GetMeAChai
        </div>
        <div className="nav-group">
          <div className="nav-label">Analytics</div>
          <Link href="/dashboard" className="nav-item active">
            <span className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              Overview
            </span>
          </Link>
          <Link href="/dashboard/payouts" className="nav-item">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue & Payouts
            </span>
          </Link>
          <Link href="/dashboard/wallet" className="nav-item">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              My Wallet
            </span>
          </Link>
          <Link href="/dashboard/audience-insights" className="nav-item">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Audience Insights
            </span>
          </Link>
        </div>
        <div className="nav-group">
          <div className="nav-label">Platform Views</div>
          <Link href="/dashboard/platform?view=search" className="nav-item">
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Search Creators
            </span>
          </Link>
          <Link href="/dashboard/platform?view=profile" className="nav-item">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Public Profile
            </span>
          </Link>
          <Link href="/dashboard/platform?view=settings" className="nav-item">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="header">
          <button className="search-trigger">
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search or type a command...
            </span>
            <span className="kbd">⌘K</span>
          </button>
          <div className="header-actions">
            {/* Header Region Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255, 255, 255, 0.03)", border: "1px solid var(--border-subtle)", padding: "4px 10px", borderRadius: "8px" }}>
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Region:</span>
              <select
                value={userRegion}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserRegion(val);
                  if (typeof window !== "undefined") {
                    localStorage.setItem("userRegion", val);
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-main)",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  outline: "none",
                  paddingRight: "4px"
                }}
              >
                <option value="USA" style={{ background: "#0a0a0a" }}>🇺🇸 United States (USD)</option>
                <option value="IND" style={{ background: "#0a0a0a" }}>🇮🇳 India (INR)</option>
              </select>
            </div>

            <button className="btn-export">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <div className="profile-container" style={{ position: "relative" }}>
              <button
                className="profile-trigger"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                {stats.avatarUrl && stats.avatarUrl !== "https://i.pravatar.cc/100?img=11" ? (
                  <img
                    src={stats.avatarUrl}
                    className="avatar"
                    alt="Profile"
                  />
                ) : (
                  <div className="avatar-letter">
                    {(stats.username || stats.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
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
                      <span className="dropdown-username">{stats.username}</span>
                      <span className="dropdown-email">{stats.email}</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        signOut();
                      }}
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

        <main className="content">
          <div className="greeting">
            <h1>Overview, {stats.username}</h1>
            <p>
              {projectedOverageVal > 0 ? (
                <>
                  You're projected to exceed your monthly goal by{" "}
                  <span className="txt-success fw-600">
                    {isUSD ? "$" : "₹"}{projectedOverageVal.toLocaleString(isUSD ? "en-US" : "en-IN")}
                  </span>.
                </>
              ) : (
                "You are on track to hit your targets this month."
              )}
            </p>
          </div>

          <div className="bento-grid">
            {/* 1. Revenue Card */}
            <div className="card c-revenue">
              <div className="card-header">
                <span className="card-title">Revenue (30 Days)</span>
                <select
                  className="dropdown"
                  style={{ border: "none", background: "transparent" }}
                >
                  <option>vs Last Month</option>
                  <option>vs Last Year</option>
                </select>
              </div>
              <div className="context-row">
                <div className="card-value">
                  {isUSD ? "$" : "₹"}{revenue.toLocaleString(isUSD ? "en-US" : "en-IN")}
                </div>
              </div>
              <div className="insight-text">
                {stats.revenueChangeText}
              </div>
              <div className="mini-stats">
                <span>
                  <span className="fw-600 text-main">Top Source:</span> {stats.topSourceText}
                </span>
                <span>
                  <span className="fw-600 text-main">Conv. Rate:</span> {stats.convRateText}
                </span>
              </div>
            </div>

            {/* 2. Monthly Goal Card */}
            <div className="card c-goal">
              <div className="card-header flex justify-between items-start w-full">
                <span className="card-title">Monthly Goal</span>
                <button
                  onClick={() => {
                    setNewGoal(String(stats.monthlyGoal ?? ""));
                    setIsSettingsOpen(true);
                  }}
                  className="opacity-60 hover:opacity-100 transition-opacity p-0.5 cursor-pointer border-none bg-transparent"
                  title="Edit Settings"
                >
                  <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
              <div className="card-value">{goalPerc}%</div>

              <div className="insight-text" style={{ marginTop: "4px" }}>
                <span className="fw-600 text-main">
                  {isUSD ? "$" : "₹"}{goalProgressVal.toLocaleString(isUSD ? "en-US" : "en-IN")}
                </span> of {isUSD ? "$" : "₹"}{monthlyGoalVal.toLocaleString(isUSD ? "en-US" : "en-IN")}
                <br />
                {monthlyGoalVal === 0
                  ? "Set a goal to track progress"
                  : goalRemaining > 0
                    ? `${isUSD ? "$" : "₹"}${goalRemaining.toLocaleString(isUSD ? "en-US" : "en-IN")} remaining`
                    : "Goal achieved! 🏆"}
              </div>

              <div className="progress-bg">
                <div
                  className="progress-bar"
                  id="goalBar"
                  style={{ width: goalWidth }}
                />
              </div>
              <div className="status-badge">{stats.goalStatusText}</div>
            </div>

            {/* 3. Profile Views Card */}
            <div className="card c-views">
              <div className="card-header">
                <span className="card-title">Profile Views</span>
              </div>
              <div className="card-value">
                {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views}
              </div>
              <div className="insight-text" style={{ marginTop: "4px" }}>
                <span className="txt-info fw-600">{stats.viewsChangeText}</span> this week
                <br />
                Previous: {stats.viewsPreviousText}
              </div>
              <div className="card-footer">
                <Link href="#" className="flex items-center gap-1">
                  View Traffic Sources <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 4. Forecast Chart Card */}
            <div className="card c-chart">
              <div className="card-header">
                <div>
                  <span className="card-title">Revenue Forecast</span>
                  <div className="chart-legend">
                    <span>
                      <span className="dot" style={{ background: "var(--success)" }} /> Actual
                    </span>
                    <span>
                      <span className="dot" style={{ background: "var(--text-faint)" }} /> Goal Target
                    </span>
                    <span>
                      <span
                        className="dot"
                        style={{
                          background: "transparent",
                          border: "1px dashed var(--success)",
                        }}
                      />{" "}
                      Projection
                    </span>
                  </div>
                </div>
                <div className="filter-group">
                  <select className="dropdown">
                    <option>30 Days</option>
                    <option>90 Days</option>
                    <option>1 Year</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
              <div style={{ height: "300px", width: "100%", marginTop: "1rem" }}>
                <canvas ref={chartRef} id="mainChart" />
              </div>
            </div>

            {/* 5. AI Insights Card */}
            <div className="card c-insights">
              <div className="ai-header">
                <Sparkles className="w-4 h-4 ai-icon" /> AI Insights
              </div>
              <div className="insight-list">
                {stats.aiInsights.map((insight, idx) => (
                  <div key={idx} className="insight-item" dangerouslySetInnerHTML={{ __html: insight }} />
                ))}
              </div>
              <div className="insight-action" style={{ marginTop: "auto" }}>
                Suggested: Share profile this weekend →
              </div>
            </div>

            {/* 6. Traffic Breakdown Card */}
            <div className="card c-sources">
              <div className="card-header">
                <span className="card-title">Audience Sources</span>
              </div>
              <div style={{ marginTop: "10px" }}>
                <div className="source-row">
                  <span className="s-label flex flex-col justify-center">
                    <span className="font-semibold text-white">Twitter</span>
                    {stats.twitterHandle && (
                      <a
                        href={`https://twitter.com/${stats.twitterHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-zinc-500 hover:text-blue-400 truncate max-w-[80px]"
                      >
                        @{stats.twitterHandle.replace('@', '')}
                      </a>
                    )}
                  </span>
                  <div className="s-bar-bg">
                    <div className="s-bar-fill" style={{ width: `${stats.audienceBreakdown.twitter}%`, background: "#1DA1F2" }} />
                  </div>
                  <span className="s-value">{stats.audienceBreakdown.twitter}%</span>
                </div>

                <div className="source-row">
                  <span className="s-label">Direct</span>
                  <div className="s-bar-bg">
                    <div
                      className="s-bar-fill"
                      style={{ width: `${stats.audienceBreakdown.direct}%`, background: "var(--text-faint)" }}
                    />
                  </div>
                  <span className="s-value">{stats.audienceBreakdown.direct}%</span>
                </div>

                <div className="source-row">
                  <span className="s-label flex flex-col justify-center">
                    <span className="font-semibold text-white">GitHub</span>
                    {stats.githubHandle && (
                      <a
                        href={`https://github.com/${stats.githubHandle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-zinc-500 hover:text-purple-400 truncate max-w-[80px]"
                      >
                        @{stats.githubHandle.replace('@', '')}
                      </a>
                    )}
                  </span>
                  <div className="s-bar-bg">
                    <div className="s-bar-fill" style={{ width: `${stats.audienceBreakdown.github}%`, background: "#fafafa" }} />
                  </div>
                  <span className="s-value">{stats.audienceBreakdown.github}%</span>
                </div>
              </div>
              <div className="card-footer flex justify-between items-center w-full">
                <Link href="#" className="flex items-center gap-1 text-zinc-400 hover:text-white">
                  View Demographics <ChevronRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    setNewGoal(String(stats.monthlyGoal ?? ""));
                    setIsSettingsOpen(true);
                  }}
                  className="text-purple-400 hover:text-purple-300 text-xs font-semibold bg-transparent border-none cursor-pointer p-0"
                >
                  Configure Links
                </button>
              </div>
            </div>

            {/* 7. Recent Transactions Feed Card */}
            <div className="card c-feed">
              <div className="card-header">
                <span className="card-title">Recent Activity</span>
              </div>

              {stats.recentActivity.length === 0 ? (
                <div className="text-zinc-500 text-sm text-center py-8">
                  No support transactions yet.
                </div>
              ) : (
                stats.recentActivity.map((activity, idx) => (
                  <div key={idx} className="feed-item">
                    <div className="feed-left">
                      <div
                        className="f-avatar"
                        style={{
                          background: activity.avatarBg,
                          color: activity.avatarColor
                        }}
                      >
                        {activity.initials}
                      </div>
                      <div className="f-details">
                        <h4>
                          {activity.name}
                          {activity.isNew && (
                            <span
                              style={{
                                background: "var(--brand-glow)",
                                color: "#c4b5fd",
                                fontSize: "0.6rem",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                marginLeft: "6px",
                              }}
                            >
                              NEW
                            </span>
                          )}
                        </h4>
                        <p>{activity.message}</p>
                      </div>
                    </div>
                    <div className="f-right">
                      <span className="f-amount txt-success">+₹{activity.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))
              )}

              <div className="card-footer">
                <Link href="#" className="flex items-center gap-1">
                  View All Transactions <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Unified Settings Configuration Modal Overlay */}
      {isSettingsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[100] p-4">
          <div className="w-full max-w-md bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-fade-in text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-purple-400" />
              Configure Dashboard Settings
            </h3>

            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Monthly Goal (₹)</label>
                <input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  className="bg-black/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 placeholder-zinc-600"
                  placeholder="e.g. 50000"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-sm font-semibold border border-zinc-800 hover:bg-zinc-900 text-zinc-400 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="px-4 py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
              >
                {isSavingSettings ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
