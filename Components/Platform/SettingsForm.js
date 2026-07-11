"use client";

import React, { useState, useEffect } from "react";
import "../../app/platform/platform.css";

export default function SettingsForm() {
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("https://i.pravatar.cc/100?img=11");

  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Fetch settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/user/settings");
        if (response.ok) {
          const data = await response.json();
          setDisplayName(data.name || "");
          setMonthlyGoal(data.monthlyGoal || "");
          setTwitterHandle(data.twitterHandle || "");
          setGithubHandle(data.githubHandle || "");
          setAvatarUrl(data.avatarUrl || "https://i.pravatar.cc/100?img=11");
        } else {
          addToast("Failed to load settings profile.", "error");
        }
      } catch (error) {
        console.error("Load settings error:", error);
        addToast("Error fetching database profile.", "error");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          monthlyGoal: monthlyGoal ? Number(monthlyGoal) : 0,
          twitterHandle,
          githubHandle,
        }),
      });

      if (response.ok) {
        addToast("Settings successfully saved to database!");
      } else {
        const err = await response.json();
        addToast(err.error || "Failed to update profile settings.", "error");
      }
    } catch (error) {
      console.error("Save settings error:", error);
      addToast("Server connection error. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url || url.includes("img=11")) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a855f7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
    }
    return url;
  };

  const tabs = ["General", "Public Profile", "Payouts", "Security"];

  if (loading) {
    return (
      <div className="platform-view-section">
        <h1 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "2rem" }}>
          Settings
        </h1>
        <div className="platform-settings-layout">
          <div className="platform-settings-nav">
            <div className="platform-set-nav-item active">General</div>
          </div>
          <div className="platform-card platform-shimmer-card">
            <div className="platform-shimmer-item" style={{ height: "40px", width: "40%", marginBottom: "1rem" }} />
            <div className="platform-shimmer-item" style={{ height: "120px", width: "100%" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="platform-view-section">
      <h1 style={{ fontSize: "1.6rem", fontWeight: 600, marginBottom: "2rem" }}>
        Settings
      </h1>

      <div className="platform-settings-layout">
        {/* Settings Navigation */}
        <div className="platform-settings-nav">
          {tabs.map((tab) => (
            <div
              key={tab}
              className={`platform-set-nav-item ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Settings Form Content */}
        <div className="platform-settings-form">
          <div className="platform-form-section">
            <div className="platform-fs-header">Profile Information</div>
            <form onSubmit={handleSave}>
              <div className="platform-fs-body">
                <div className="platform-avatar-upload">
                  <img
                    src={getAvatarUrl(avatarUrl)}
                    className="platform-avatar-preview"
                    alt="Avatar Preview"
                  />
                  <div>
                    <button
                      type="button"
                      className="platform-btn-outline"
                      style={{ marginBottom: "8px" }}
                    >
                      Change Avatar
                    </button>
                    <p className="platform-form-hint">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>

                <div className="platform-form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    className="platform-form-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="platform-form-group">
                  <label>Monthly Goal (₹)</label>
                  <input
                    type="number"
                    className="platform-form-input"
                    value={monthlyGoal}
                    onChange={(e) => setMonthlyGoal(e.target.value)}
                    placeholder="Enter monthly goal amount"
                  />
                </div>

                <div className="platform-form-group">
                  <label>Twitter Handle</label>
                  <input
                    type="text"
                    className="platform-form-input"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    placeholder="@handle"
                  />
                </div>

                <div className="platform-form-group">
                  <label>GitHub Username</label>
                  <input
                    type="text"
                    className="platform-form-input"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="username"
                  />
                </div>
              </div>
              
              <div className="platform-fs-footer">
                <button 
                  type="submit" 
                  className="platform-btn-primary" 
                  disabled={saving}
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          <div className="platform-form-section">
            <div className="platform-fs-header">Social Connections</div>
            <div className="platform-fs-body">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid var(--platform-border-faint)",
                  paddingBottom: "1rem",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                    Twitter Account
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--platform-text-faint)",
                      marginTop: "2px",
                    }}
                  >
                    {twitterHandle ? `@${twitterHandle.replace('@', '')}` : "Not Connected"}
                  </div>
                </div>
                <button
                  type="button"
                  className="platform-btn-outline"
                  style={{ color: "var(--platform-text-muted)" }}
                >
                  {twitterHandle ? "Disconnect" : "Connect"}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                    GitHub Account
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--platform-text-faint)",
                      marginTop: "2px",
                    }}
                  >
                    {githubHandle ? `@${githubHandle.replace('@', '')}` : "Connect your repositories"}
                  </div>
                </div>
                <button type="button" className="platform-btn-outline">
                  {githubHandle ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification Containers */}
      <div className="platform-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`platform-toast ${toast.type}`}>
            <span>{toast.type === "success" ? "✓" : "⚠"}</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
