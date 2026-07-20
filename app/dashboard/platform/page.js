"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Search,
  LogOut,
  User,
  Settings as SettingsIcon,
  Compass,
  Wallet,
  MapPin
} from "lucide-react";
import SearchCreators from "../../../Components/Platform/SearchCreators";
import PublicProfile from "../../../Components/Platform/PublicProfile";
import SettingsForm from "../../../Components/Platform/SettingsForm";
import "../dashboard.css";
import "../../platform/platform.css";

function PlatformUnifiedPageInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Region & Localisation State: "USA" (USD) or "IND" (INR)
  const [userRegion, setUserRegion] = useState("USA");

  // Load region from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userRegion");
      if (saved) {
        setUserRegion(saved);
      }
    }
  }, []);

  // SPA View Switcher
  const [activeView, setActiveView] = useState("search"); // 'search' | 'profile' | 'settings'
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Sync active view with the URL search parameter
  const viewParam = searchParams.get("view");
  useEffect(() => {
    if (viewParam && ["search", "profile", "settings"].includes(viewParam)) {
      setActiveView(viewParam);
    }
  }, [viewParam]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Loading Platform System...</p>
        </div>
      </div>
    );
  }

  const handleSelectCreator = (creator) => {
    setSelectedCreator(creator);
    setActiveView("profile");
    router.push("/dashboard/platform?view=profile");
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedCreator(null);
    router.push(`/dashboard/platform?view=${view}`);
  };

  return (
    <div className="dashboard-body">
      {/* Sidebar - Reuses the exact styling of the current sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span>▲</span> GetMeAChai
        </div>
        
        <div className="nav-group">
          <div className="nav-label">Analytics</div>
          <button onClick={() => router.push("/dashboard")} className="nav-item w-full text-left bg-transparent border-none cursor-pointer">
            <span className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </span>
          </button>
          <button onClick={() => router.push("/dashboard/payouts")} className="nav-item w-full text-left bg-transparent border-none cursor-pointer">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue & Payouts
            </span>
          </button>
          <button onClick={() => router.push("/dashboard/wallet")} className="nav-item w-full text-left bg-transparent border-none cursor-pointer">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              My Wallet
            </span>
          </button>
          <button onClick={() => router.push("/dashboard/audience-insights")} className="nav-item w-full text-left bg-transparent border-none cursor-pointer">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Audience Insights
            </span>
          </button>
        </div>

        <div className="nav-group" style={{ marginTop: "1rem" }}>
          <div className="nav-label">Platform Views</div>
          <button 
            onClick={() => handleViewChange("search")} 
            className={`nav-item w-full text-left bg-transparent border-none cursor-pointer ${activeView === "search" ? "active text-purple-400" : ""}`}
          >
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Search Creators
            </span>
          </button>
          <button 
            onClick={() => handleViewChange("profile")} 
            className={`nav-item w-full text-left bg-transparent border-none cursor-pointer ${activeView === "profile" ? "active text-purple-400" : ""}`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Public Profile
            </span>
          </button>
          <button 
            onClick={() => handleViewChange("settings")} 
            className={`nav-item w-full text-left bg-transparent border-none cursor-pointer ${activeView === "settings" ? "active text-purple-400" : ""}`}
          >
            <span className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              Settings
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Header - Reuses the exact styling and elements of the current header */}
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

            <button className="btn-export" onClick={() => router.push("/dashboard")}>
              ↗ Go to Dashboard
            </button>
            <div className="profile-container" style={{ position: "relative" }}>
              <button
                className="profile-trigger"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
              >
                <div className="avatar-letter">
                  {(session?.user?.email || "U").charAt(0).toUpperCase()}
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
                      <span className="dropdown-username">{session?.user?.name || "User"}</span>
                      <span className="dropdown-email">{session?.user?.email}</span>
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

        {/* Content Wrapper */}
        <main className="content" style={{ padding: "2.5rem" }}>
          {activeView === "search" && (
            <SearchCreators onSelectProfile={handleSelectCreator} />
          )}
          {activeView === "profile" && (
            <PublicProfile creator={selectedCreator} userRegion={userRegion} />
          )}
          {activeView === "settings" && (
            <SettingsForm userRegion={userRegion} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function PlatformUnifiedPage() {
  return (
    <Suspense fallback={
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Loading Platform System...</p>
        </div>
      </div>
    }>
      <PlatformUnifiedPageInner />
    </Suspense>
  );
}
