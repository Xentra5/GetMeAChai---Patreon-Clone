"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Wallet,
  Compass,
  User,
  MessageSquare,
  Settings,
} from "lucide-react";

export default function Sidebar({ activeTab, activeSubView }) {
  const [userRole, setUserRole] = useState("creator"); // default

  useEffect(() => {
    // 1. Initial local storage check for instant render response
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userAccountType");
      if (storedRole && storedRole.toLowerCase() === "student") {
        setUserRole("student");
      }
    }

    // 2. Fetch authoritative user settings from API
    async function fetchUserRole() {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.role) {
            const roleLower = data.role.toLowerCase();
            setUserRole(roleLower);
            if (typeof window !== "undefined") {
              localStorage.setItem("userAccountType", roleLower === "student" ? "Student" : "Creator");
            }
          }
        }
      } catch (err) {
        console.error("Sidebar role fetch error:", err);
      }
    }

    fetchUserRole();
  }, []);

  const isStudent = userRole === "student";

  return (
    <aside className="sidebar select-none">
      <div className="brand">
        <span style={{ color: "var(--brand, #a855f7)" }}>▲</span> GetMeAChai
      </div>

      <div className="nav-group">
        <div className="nav-label">{isStudent ? "My Account" : "Analytics"}</div>

        {/* Creator-only: Overview */}
        {!isStudent && (
          <Link
            href="/dashboard"
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
          >
            <span className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-purple-400" />
              Overview
            </span>
          </Link>
        )}

        {/* Creator-only: Revenue & Payouts */}
        {!isStudent && (
          <Link
            href="/dashboard/payouts"
            className={`nav-item ${activeTab === "payouts" ? "active" : ""}`}
          >
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue & Payouts
            </span>
          </Link>
        )}

        {/* Visible for all: My Wallet */}
        <Link
          href="/dashboard/wallet"
          className={`nav-item ${activeTab === "wallet" ? "active" : ""}`}
        >
          <span className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-cyan-400" />
            My Wallet
          </span>
        </Link>

        {/* Creator-only: Audience Insights */}
        {!isStudent && (
          <Link
            href="/dashboard/audience-insights"
            className={`nav-item ${activeTab === "audience" ? "active" : ""}`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Audience Insights
            </span>
          </Link>
        )}
      </div>

      <div className="nav-group">
        <div className="nav-label">Platform Views</div>
        <Link
          href="/dashboard/platform?view=search"
          className={`nav-item ${activeTab === "platform" && activeSubView === "search" ? "active" : ""}`}
        >
          <span className="flex items-center gap-2">
            <Compass className="w-4 h-4" />
            Search Creators
          </span>
        </Link>
        <Link
          href="/dashboard/platform?view=profile"
          className={`nav-item ${activeTab === "platform" && activeSubView === "profile" ? "active" : ""}`}
        >
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Public Profile
          </span>
        </Link>
        <Link
          href="/dashboard/platform?view=dms"
          className={`nav-item ${activeTab === "platform" && activeSubView === "dms" ? "active" : ""}`}
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Direct Messages
          </span>
        </Link>
        <Link
          href="/dashboard/platform?view=settings"
          className={`nav-item ${activeTab === "platform" && activeSubView === "settings" ? "active" : ""}`}
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </span>
        </Link>
      </div>
    </aside>
  );
}
