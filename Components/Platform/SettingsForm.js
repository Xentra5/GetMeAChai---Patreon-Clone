"use client";

import React, { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import "../../app/platform/platform.css";

export default function SettingsForm({ userRegion, userRole }) {
  const isStudent = userRole === "student";
  const [activeTab, setActiveTab] = useState("General");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [category, setCategory] = useState("Engineering");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("https://i.pravatar.cc/100?img=11");
  const [coverUrl, setCoverUrl] = useState("");
  const [supportToken, setSupportToken] = useState("Chai");

  // Custom membership tier prices
  const [bronzePrice, setBronzePrice] = useState(100);
  const [silverPrice, setSilverPrice] = useState(500);
  const [goldPrice, setGoldPrice] = useState(1000);

  // Payout Schedule settings
  const [payoutScheduleFrequency, setPayoutScheduleFrequency] = useState("Every Friday");
  const [payoutNextDate, setPayoutNextDate] = useState("Friday, Oct 25");
  const [payoutProcessingTime, setPayoutProcessingTime] = useState("1-2 business days");
  const [payoutMinimumThreshold, setPayoutMinimumThreshold] = useState(1000);

  // Toast notifications state
  const [toasts, setToasts] = useState([]);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [updating2FA, setUpdating2FA] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [confirm2FAPassword, setConfirm2FAPassword] = useState("");
  const [confirm2FAPasswordRepeat, setConfirm2FAPasswordRepeat] = useState("");

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
          if (userRegion === "USA") {
            setMonthlyGoal(data.monthlyGoal ? Math.round(data.monthlyGoal / 83.5) : "");
          } else {
            setMonthlyGoal(data.monthlyGoal || "");
          }
          setCategory(data.category || "Engineering");
          setTwitterHandle(data.twitterHandle || "");
          setGithubHandle(data.githubHandle || "");
          setAvatarUrl(data.avatarUrl || "https://i.pravatar.cc/100?img=11");
          setCoverUrl(data.coverUrl || "");
          setSupportToken(data.supportToken || "Chai");

          setBronzePrice(data.bronzePrice ?? 100);
          setSilverPrice(data.silverPrice ?? 500);
          setGoldPrice(data.goldPrice ?? 1000);
          setPayoutScheduleFrequency(data.payoutScheduleFrequency || "Every Friday");
          setPayoutNextDate(data.payoutNextDate || "Friday, Oct 25");
          setPayoutProcessingTime(data.payoutProcessingTime || "1-2 business days");
          setPayoutMinimumThreshold(data.payoutMinimumThreshold ?? 1000);
          setIs2FAEnabled(data.is2FAEnabled ?? false);
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
  }, [userRegion]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const goalInINR = monthlyGoal ? (userRegion === "USA" ? Number(monthlyGoal) * 83.5 : Number(monthlyGoal)) : 0;
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          monthlyGoal: goalInINR,
          category,
          twitterHandle,
          githubHandle,
          supportToken,
          bronzePrice: Number(bronzePrice),
          silverPrice: Number(silverPrice),
          goldPrice: Number(goldPrice),
          payoutScheduleFrequency,
          payoutNextDate,
          payoutProcessingTime,
          payoutMinimumThreshold: Number(payoutMinimumThreshold),
          avatarUrl,
          coverUrl,
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

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      addToast("Please fill in both password fields.", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("New password must be at least 8 characters long.", "error");
      return;
    }
    setUpdatingPassword(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (response.ok) {
        addToast("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        const data = await response.json();
        addToast(data.error || "Failed to update password.", "error");
      }
    } catch (error) {
      console.error("Password update error:", error);
      addToast("Connection error. Please try again.", "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const getAvatarUrl = (url) => {
    if (!url || url.includes("img=11")) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a855f7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
    }
    return url;
  };

  const allTabs = ["General", "Public Profile", "Payouts", "Security"];
  const tabs = isStudent ? allTabs.filter(t => t !== "Public Profile" && t !== "Payouts") : allTabs;

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
          <div style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1rem" }}>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="platform-set-nav-item"
              style={{
                color: "#f43f5e",
                width: "100%",
                textAlign: "left",
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px"
              }}
            >
              <svg style={{ width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Settings Form Content */}
        <div className="platform-settings-form">
          {activeTab === "General" && (
            <>
              <div className="platform-form-section">
                <div className="platform-fs-header">Profile Information</div>
                <form onSubmit={handleSave}>
                  <div className="platform-fs-body">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1rem" }}>
                      <div className="platform-avatar-upload">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getAvatarUrl(avatarUrl)}
                          className="platform-avatar-preview"
                          alt="Avatar Preview"
                          style={{ border: "2px solid var(--platform-brand)" }}
                        />
                        <div>
                          <label style={{ fontSize: "0.85rem", fontWeight: "600", display: "block", marginBottom: "4px" }}>Profile Picture (PFP)</label>
                          <p className="platform-form-hint">Supports animated GIFs and standard image URLs</p>
                        </div>
                      </div>

                      {coverUrl && (
                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
                          <div style={{
                            width: "120px",
                            height: "64px",
                            borderRadius: "var(--platform-radius-sm)",
                            backgroundImage: `url(${coverUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            border: "1px solid var(--platform-border-strong)"
                          }} />
                          <div>
                            <label style={{ fontSize: "0.85rem", fontWeight: "600", display: "block", marginBottom: "4px" }}>Cover Banner Preview</label>
                            <p className="platform-form-hint">Custom cover photo/GIF banner active</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="platform-form-group">
                      <label>Profile Picture (PFP) URL</label>
                      <input
                        type="text"
                        className="platform-form-input"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="Paste direct link to image or GIF..."
                        style={{ maxWidth: "100%" }}
                      />
                    </div>

                    <div className="platform-form-group">
                      <label>Cover Banner URL</label>
                      <input
                        type="text"
                        className="platform-form-input"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        placeholder="Paste direct link to banner image or GIF..."
                        style={{ maxWidth: "100%" }}
                      />
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
                      <label>Monthly Goal ({userRegion === "USA" ? "$" : "₹"})</label>
                      <input
                        type="number"
                        className="platform-form-input"
                        value={monthlyGoal}
                        onChange={(e) => setMonthlyGoal(e.target.value)}
                        placeholder="Enter monthly goal amount"
                      />
                    </div>

                    <div className="platform-form-group">
                      <label>Support Token / Emoji</label>
                      <select
                        className="platform-form-input"
                        value={supportToken}
                        onChange={(e) => setSupportToken(e.target.value)}
                        style={{ background: "#000", border: "1px solid var(--platform-border-input)" }}
                      >
                        <option value="Chai">Chai 🍵</option>
                        <option value="Coffee">Coffee ☕</option>
                        <option value="Beer">Beer 🍺</option>
                        <option value="Pizza">Pizza 🍕</option>
                      </select>
                    </div>

                    <div className="platform-form-group">
                      <label>Profile Category</label>
                      <select
                        className="platform-form-input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ background: "#000", border: "1px solid var(--platform-border-input)" }}
                      >
                        <option value="Design">Design</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Writing">Writing</option>
                        <option value="Video">Video</option>
                      </select>
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
                      style={{ color: twitterHandle ? "#e11d48" : "var(--platform-brand)" }}
                      onClick={async () => {
                        let newTwitter = "";
                        if (twitterHandle) {
                          newTwitter = "";
                          setTwitterHandle("");
                        } else {
                          const input = prompt("Enter your Twitter / X handle:");
                          if (input === null) return;
                          newTwitter = input.replace('@', '').trim();
                          setTwitterHandle(newTwitter);
                        }
                        try {
                          const res = await fetch("/api/user/settings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ twitterHandle: newTwitter })
                          });
                          if (res.ok) {
                            addToast(newTwitter ? "Twitter account connected!" : "Twitter account disconnected.");
                          }
                        } catch (err) {
                          console.error("Error saving twitter handle:", err);
                        }
                      }}
                    >
                      {twitterHandle ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "1rem",
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
                    <button 
                      type="button" 
                      className="platform-btn-outline"
                      style={{ color: githubHandle ? "#e11d48" : "var(--platform-brand)" }}
                      onClick={async () => {
                        let newGithub = "";
                        if (githubHandle) {
                          newGithub = "";
                          setGithubHandle("");
                        } else {
                          const input = prompt("Enter your GitHub username:");
                          if (input === null) return;
                          newGithub = input.replace('@', '').trim();
                          setGithubHandle(newGithub);
                        }
                        try {
                          const res = await fetch("/api/user/settings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ githubHandle: newGithub })
                          });
                          if (res.ok) {
                            addToast(newGithub ? "GitHub account connected!" : "GitHub account disconnected.");
                          }
                        } catch (err) {
                          console.error("Error saving github handle:", err);
                        }
                      }}
                    >
                      {githubHandle ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="platform-form-section" style={{ border: "1px solid rgba(244, 63, 94, 0.2)" }}>
                <div className="platform-fs-header" style={{ color: "#f43f5e" }}>Account Session</div>
                <div className="platform-fs-body">
                  <p className="platform-form-hint" style={{ marginBottom: "1.2rem" }}>
                    Sign out of your account on this device.
                  </p>
                  <button
                    type="button"
                    className="platform-btn-outline"
                    style={{
                      color: "#f43f5e",
                      borderColor: "rgba(244, 63, 94, 0.3)",
                      background: "rgba(244, 63, 94, 0.05)"
                    }}
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "Public Profile" && (
            <div className="platform-form-section">
              <div className="platform-fs-header">Membership Tier Pricing</div>
              <form onSubmit={handleSave}>
                <div className="platform-fs-body">
                  <p className="platform-form-hint" style={{ marginBottom: "1rem" }}>
                    Configure the monthly price for each support level. Prices are stored in INR (₹) and automatically converted to USD ($) on demand.
                  </p>
                  
                  <div className="platform-form-group">
                    <label>🥉 Bronze Tier Price (₹)</label>
                    <input
                      type="number"
                      className="platform-form-input"
                      value={bronzePrice}
                      onChange={(e) => setBronzePrice(e.target.value)}
                      required
                    />
                    <span className="platform-form-hint">
                      Equivalency: ~${(bronzePrice / 83.5).toFixed(2)}
                    </span>
                  </div>

                  <div className="platform-form-group">
                    <label>🥈 Silver Tier Price (₹)</label>
                    <input
                      type="number"
                      className="platform-form-input"
                      value={silverPrice}
                      onChange={(e) => setSilverPrice(e.target.value)}
                      required
                    />
                    <span className="platform-form-hint">
                      Equivalency: ~${(silverPrice / 83.5).toFixed(2)}
                    </span>
                  </div>

                  <div className="platform-form-group">
                    <label>🥇 Gold Tier Price (₹)</label>
                    <input
                      type="number"
                      className="platform-form-input"
                      value={goldPrice}
                      onChange={(e) => setGoldPrice(e.target.value)}
                      required
                    />
                    <span className="platform-form-hint">
                      Equivalency: ~${(goldPrice / 83.5).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="platform-fs-footer">
                  <button 
                    type="submit" 
                    className="platform-btn-primary" 
                    disabled={saving}
                  >
                    {saving ? "Saving Prices..." : "Save Tier Prices"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "Payouts" && (
            <div className="platform-form-section">
              <div className="platform-fs-header">Payout Schedule Customization</div>
              <form onSubmit={handleSave}>
                <div className="platform-fs-body">
                  <p className="platform-form-hint" style={{ marginBottom: "1rem" }}>
                    Customize your payout frequency, next scheduled date, processing timeframe, and minimal payout threshold.
                  </p>

                  <div className="platform-form-group">
                    <label>Payout Frequency</label>
                    <input
                      type="text"
                      className="platform-form-input"
                      value={payoutScheduleFrequency}
                      onChange={(e) => setPayoutScheduleFrequency(e.target.value)}
                      placeholder="e.g. Every Friday, Monthly, Bi-weekly"
                      required
                    />
                  </div>

                  <div className="platform-form-group">
                    <label>Next Payout Date</label>
                    <input
                      type="text"
                      className="platform-form-input"
                      value={payoutNextDate}
                      onChange={(e) => setPayoutNextDate(e.target.value)}
                      placeholder="e.g. Friday, Oct 25"
                      required
                    />
                  </div>

                  <div className="platform-form-group">
                    <label>Processing Duration</label>
                    <input
                      type="text"
                      className="platform-form-input"
                      value={payoutProcessingTime}
                      onChange={(e) => setPayoutProcessingTime(e.target.value)}
                      placeholder="e.g. 1-2 business days, Instant"
                      required
                    />
                  </div>

                  <div className="platform-form-group">
                    <label>Minimum Threshold (₹)</label>
                    <input
                      type="number"
                      className="platform-form-input"
                      value={payoutMinimumThreshold}
                      onChange={(e) => setPayoutMinimumThreshold(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="platform-fs-footer">
                  <button 
                    type="submit" 
                    className="platform-btn-primary" 
                    disabled={saving}
                  >
                    {saving ? "Saving Payouts..." : "Save Payout Settings"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "Security" && (
            <>
              <div className="platform-form-section">
                <div className="platform-fs-header">Account Security</div>
                <form onSubmit={handleUpdatePassword}>
                  <div className="platform-fs-body">
                    <p style={{ color: "var(--platform-text-muted)", fontSize: "0.9rem" }}>
                      To maintain the security of your account, you can update your password below.
                    </p>
                    <div className="platform-form-group" style={{ marginTop: "1rem" }}>
                      <label>Current Password</label>
                      <input
                        type="password"
                        className="platform-form-input"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="platform-form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        className="platform-form-input"
                        placeholder="Enter new password (min. 8 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="platform-fs-footer">
                    <button type="submit" className="platform-btn-primary" disabled={updatingPassword}>
                      {updatingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="platform-form-section" style={{ marginTop: "2rem" }}>
                <div className="platform-fs-header">Two-Factor Authentication (2FA)</div>
                <div className="platform-fs-body">
                  <p style={{ color: "var(--platform-text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                    Add an extra layer of security to your account. When enabled, logging in will require verification via a 6-digit OTP code sent to your email.
                  </p>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(255,255,255,0.02)",
                    padding: "1rem 1.25rem",
                    borderRadius: "8px",
                    border: "1px solid var(--platform-border-subtle)"
                  }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Email Verification (OTP)</span>
                      <div style={{ fontSize: "0.8rem", color: "var(--platform-text-faint)", marginTop: "3px" }}>
                        Status: <strong style={{ color: is2FAEnabled ? "#10b981" : "#f43f5e" }}>{is2FAEnabled ? "Enabled" : "Disabled"}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setConfirm2FAPassword("");
                        setConfirm2FAPasswordRepeat("");
                        setShow2FAModal(true);
                      }}
                      className="platform-btn-outline"
                      style={{
                        color: is2FAEnabled ? "#f43f5e" : "var(--platform-brand)",
                        borderColor: is2FAEnabled ? "rgba(244, 63, 94, 0.3)" : "rgba(168, 85, 247, 0.3)",
                        background: is2FAEnabled ? "rgba(244, 63, 94, 0.05)" : "rgba(168, 85, 247, 0.05)"
                      }}
                      disabled={updating2FA}
                    >
                      {is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Modal for password verification twice */}
              {show2FAModal && (
                <div style={{
                  position: "fixed",
                  inset: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  padding: "16px"
                }}>
                  <div style={{
                    backgroundColor: "#121316",
                    border: "1px solid #1f2937",
                    borderRadius: "16px",
                    padding: "24px",
                    maxWidth: "400px",
                    width: "100%",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
                  }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                      {is2FAEnabled ? "Disable" : "Enable"} Two-Factor Authentication
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "var(--platform-text-muted)", marginBottom: "20px", lineHeight: "1.4" }}>
                      Please verify your password to secure this request. You must enter your current password twice to confirm changes.
                    </p>

                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      if (confirm2FAPassword !== confirm2FAPasswordRepeat) {
                        addToast("Passwords do not match.", "error");
                        return;
                      }

                      setShow2FAModal(false);
                      setUpdating2FA(true);
                      try {
                        const res = await fetch("/api/user/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            toggle2FA: !is2FAEnabled,
                            confirmPasswordFor2FA: confirm2FAPassword
                          })
                        });

                        const data = await res.json();
                        if (res.ok) {
                          setIs2FAEnabled(!is2FAEnabled);
                          addToast(`Successfully ${!is2FAEnabled ? "enabled" : "disabled"} Two-Factor Authentication!`);
                        } else {
                          addToast(data.error || "Verification failed.", "error");
                        }
                      } catch (err) {
                        addToast("Error updating security options", "error");
                      } finally {
                        setUpdating2FA(false);
                      }
                    }} className="space-y-4">
                      <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "6px" }}>
                          Enter Password
                        </label>
                        <input
                          type="password"
                          required
                          value={confirm2FAPassword}
                          onChange={(e) => setConfirm2FAPassword(e.target.value)}
                          placeholder="••••••••"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            border: "1px solid #1f2937",
                            backgroundColor: "#090a0f",
                            padding: "10px 12px",
                            color: "#fff",
                            outline: "none",
                            fontSize: "0.9rem"
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "6px" }}>
                          Confirm Password Again
                        </label>
                        <input
                          type="password"
                          required
                          value={confirm2FAPasswordRepeat}
                          onChange={(e) => setConfirm2FAPasswordRepeat(e.target.value)}
                          placeholder="••••••••"
                          style={{
                            width: "100%",
                            borderRadius: "8px",
                            border: "1px solid #1f2937",
                            backgroundColor: "#090a0f",
                            padding: "10px 12px",
                            color: "#fff",
                            outline: "none",
                            fontSize: "0.9rem"
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", gap: "12px", paddingTop: "12px" }}>
                        <button
                          type="button"
                          onClick={() => setShow2FAModal(false)}
                          className="platform-btn-outline"
                          style={{ flex: 1, padding: "10px 0", justifyContent: "center" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="platform-btn-primary"
                          style={{ flex: 1, padding: "10px 0", background: is2FAEnabled ? "#f43f5e" : "var(--platform-brand)" }}
                        >
                          Confirm
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
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
