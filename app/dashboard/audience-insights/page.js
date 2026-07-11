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
  LogOut,
  Compass,
  User,
  Settings
} from "lucide-react";
import "../dashboard.css";

// Register Chart.js modules
Chart.register(...registerables);

export default function AudienceInsights() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedRange, setSelectedRange] = useState("Last 30 Days");

  // Counter states for animated values
  const [totalSupporters, setTotalSupporters] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [returningSupporters, setReturningSupporters] = useState(0);
  const [avgValue, setAvgValue] = useState(0);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch insights data
  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchInsights = async () => {
      try {
        const response = await fetch("/api/dashboard/audience-insights");
        if (response.ok) {
          const resData = await response.json();
          setData(resData);
        } else {
          console.error("Failed to fetch audience insights stats");
        }
      } catch (error) {
        console.error("Error fetching insights stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [status]);

  // Helper for number animation
  const animateValue = (setValue, start, end, duration) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = easeOut * (end - start) + start;

      setValue(currentVal);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };
    window.requestAnimationFrame(step);
  };

  // Trigger animations when data is loaded
  useEffect(() => {
    if (!data) return;

    // Reset values first
    setTotalSupporters(0);
    setConversionRate(0);
    setReturningSupporters(0);
    setAvgValue(0);

    // Animate stats
    animateValue(setTotalSupporters, 0, data.totalSupportersCount, 1500);
    animateValue(setConversionRate, 0, data.conversionRate, 1500);
    animateValue(setReturningSupporters, 0, data.returningPercentage, 1500);
    animateValue(setAvgValue, 0, data.avgValuePerSupporter, 1500);
  }, [data]);

  // Chart initialization
  useEffect(() => {
    if (!data || !chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");

    // Destroy existing chart to prevent canvas reuse issues
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Twitter", "GitHub", "Direct", "Other"],
        datasets: [
          {
            data: [
              data.trafficStats.twitter,
              data.trafficStats.github,
              data.trafficStats.direct,
              data.trafficStats.other
            ],
            backgroundColor: [
              "#1DA1F2", // Twitter Blue
              "#fafafa", // GitHub White
              "#8b5cf6", // Direct Brand Purple
              "#333333"  // Other
            ],
            borderWidth: 2,
            borderColor: "#121212",
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#1c1c1f",
            titleColor: "#ededed",
            bodyColor: "#a1a1aa",
            borderColor: "rgba(255,255,255,0.1)",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: function (context) {
                return " " + context.parsed + "% of traffic";
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  // Loading state
  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Loading audience insights system...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="dashboard-body">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span>▲</span> GetMeAChai
        </div>
        <div className="nav-group">
          <div className="nav-label">Analytics</div>
          <Link href="/dashboard" className="nav-item">
            <span className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </span>
          </Link>
          <Link href="/dashboard/payouts" className="nav-item">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue & Payouts
            </span>
          </Link>
          <Link href="/dashboard/audience-insights" className="nav-item active">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
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
              Search audience...
            </span>
            <span className="kbd">⌘K</span>
          </button>
          <div className="header-actions">
            <button className="btn-export">
              <Download className="w-4 h-4" /> Export Data
            </button>
            <div className="profile-container" style={{ position: "relative" }}>
              <button
                className="profile-trigger"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                {data.avatarUrl && data.avatarUrl !== "https://i.pravatar.cc/100?img=11" ? (
                  <img
                    src={data.avatarUrl}
                    className="avatar"
                    alt="Profile"
                  />
                ) : (
                  <div className="avatar-letter">
                    {(data.username || data.email || "U").charAt(0).toUpperCase()}
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
                      <span className="dropdown-username">{data.username}</span>
                      <span className="dropdown-email">{data.email}</span>
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
          <div className="page-header flex-between">
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: "600", letterSpacing: "-0.03em", marginBottom: "6px" }}>
                Audience Insights
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Understand who your supporters are and how they interact with your page.
              </p>
            </div>
            <select
              className="date-picker dropdown"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border-strong)" }}
            >
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>This Year</option>
            </select>
          </div>

          {/* ROW 1: KPI GRID */}
          <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            <div className="card">
              <div className="c-title">
                Total Unique Supporters{" "}
                <div className="c-icon" style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--info)" }}>
                  👥
                </div>
              </div>
              <div className="c-value">{Math.floor(totalSupporters).toLocaleString("en-IN")}</div>
              <div className="c-trend">
                <span className="trend-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                  ▲ 8%
                </span>{" "}
                vs last month
              </div>
            </div>
            <div className="card">
              <div className="c-title">
                Conversion Rate{" "}
                <div className="c-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
                  ⚡
                </div>
              </div>
              <div className="c-value">{conversionRate.toFixed(1)}%</div>
              <div className="c-trend">
                <span className="trend-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                  ▲ 1.1%
                </span>{" "}
                pageview to support
              </div>
            </div>
            <div className="card">
              <div className="c-title">
                Returning Supporters{" "}
                <div className="c-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--brand)" }}>
                  🔁
                </div>
              </div>
              <div className="c-value">{Math.floor(returningSupporters)}%</div>
              <div className="c-trend">
                <span className="trend-badge" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)" }}>
                  ▲ 5%
                </span>{" "}
                high loyalty rate
              </div>
            </div>
            <div className="card">
              <div className="c-title">
                Avg. Value Per Supporter{" "}
                <div className="c-icon" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}>
                  💎
                </div>
              </div>
              <div className="c-value">₹{Math.floor(avgValue).toLocaleString("en-IN")}</div>
              <div className="c-trend">
                <span className="trend-badge" style={{ background: "rgba(255, 255, 255, 0.1)", color: "var(--text-muted)" }}>
                  - 0%
                </span>{" "}
                stable average
              </div>
            </div>
          </div>

          {/* ROW 2: DEMOGRAPHICS */}
          <div className="data-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {/* Traffic Sources */}
            <div className="card">
              <div className="panel-title flex-between">
                Traffic Sources{" "}
                <span style={{ fontSize: "0.8rem", color: "var(--text-faint)", fontWeight: "400" }}>By Volume</span>
              </div>
              <div className="chart-wrapper">
                <canvas ref={chartRef} id="sourceChart"></canvas>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                    {(data.totalViews || 0).toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Visits</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1DA1F2" }}></span> Twitter
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fafafa" }}></span> GitHub
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#8b5cf6" }}></span> Direct
                </span>
              </div>
            </div>

            {/* Demographics countries */}
            <div className="card panel-span-2">
              <div className="panel-title flex-between">
                Supporter Demographics{" "}
                <a href="#" style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "none" }}>
                  View Map →
                </a>
              </div>
              <div className="hbar-list" style={{ marginTop: "10px" }}>
                {data.countries.map((country, index) => (
                  <div className="hbar-item" key={index}>
                    <div className="hbar-header">
                      <span className="hbar-name">
                        {country.code} {country.name}
                      </span>
                      <span className="hbar-val">
                        {country.percentage}% ({country.count})
                      </span>
                    </div>
                    <div className="hbar-track">
                      <div
                        className="hbar-fill"
                        style={{
                          width: `${country.percentage}%`,
                          background: index === 0 ? "var(--brand)" : `rgba(139, 92, 246, ${1 - index * 0.25})`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3: DEEP DIVE & AI */}
          <div className="data-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {/* Top Supporters */}
            <div className="card panel-span-2">
              <div className="panel-title flex-between">
                Top Supporters{" "}
                <span style={{ fontSize: "0.8rem", color: "var(--text-faint)", fontWeight: "400" }}>
                  Ranked by Lifetime Value
                </span>
              </div>

              <div className="supporter-list">
                {data.topSupporters.length > 0 ? (
                  data.topSupporters.map((supporter, idx) => (
                    <div className="supporter-row" key={idx}>
                      <div className="s-left">
                        <div className="s-avatar" style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--brand)" }}>
                          {supporter.initials}
                        </div>
                        <div className="s-info">
                          <h4 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", fontWeight: "600" }}>
                            {supporter.name}{" "}
                            {supporter.isTopOnePercent && <span className="s-badge">Top 1%</span>}
                            {supporter.isMonthlySub && <span className="s-badge">Monthly Sub</span>}
                          </h4>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                            Supported {supporter.count} times • Last active {supporter.lastActiveStr}
                          </p>
                        </div>
                      </div>
                      <div className="s-right">
                        <div className="s-amount">₹{supporter.ltv.toLocaleString("en-IN")} LTV</div>
                        <div className="s-action">Send Message →</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "10px 0" }}>
                    No supporters yet. Start receiving support to see top supporters list.
                  </p>
                )}

                <button className="btn-outline" style={{ width: "100%", marginTop: "10px", borderColor: "var(--border-faint)" }}>
                  View Full Supporter List
                </button>
              </div>
            </div>

            {/* AI Insights */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="card ai-widget" style={{ flexGrow: 1 }}>
                <div className="ai-title">
                  <span className="ai-sparkle">✨</span> Audience Insights
                </div>
                <div className="ai-list">
                  {data.aiInsights.map((insight, idx) => (
                    <div
                      className="ai-item"
                      key={idx}
                      dangerouslySetInnerHTML={{ __html: insight }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
