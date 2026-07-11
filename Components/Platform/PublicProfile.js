"use client";

import React, { useState } from "react";
import "../../app/platform/platform.css";

export default function PublicProfile({ creator }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!creator);
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");

  React.useEffect(() => {
    if (!creator) {
      async function loadMyProfile() {
        try {
          const response = await fetch("/api/user/settings");
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        } finally {
          setLoading(false);
        }
      }
      loadMyProfile();
    }
  }, [creator]);

  if (loading) {
    return (
      <div className="platform-view-section" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentCreator = creator || currentUser || {
    name: "User",
    email: "user@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    twitterHandle: "",
    githubHandle: "",
    monthlyGoal: 0,
    profileViews: 0,
  };

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
  };

  const getButtonText = () => {
    if (selectedAmount === "Custom") {
      return customAmount ? `Support with ₹${customAmount}` : "Enter Custom Amount";
    }
    return `Support with ₹${selectedAmount}`;
  };

  const getAvatarUrl = (url) => {
    if (!url || url.includes("img=11")) {
      return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a855f7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
    }
    return url;
  };

  const creatorName = currentCreator.name || currentCreator.email.split("@")[0];
  const twitterClean = currentCreator.twitterHandle ? currentCreator.twitterHandle.replace("@", "") : "";
  const githubClean = currentCreator.githubHandle ? currentCreator.githubHandle.replace("@", "") : "";
  const creatorHandle = `@${twitterClean || githubClean || creatorName.toLowerCase().replace(/\s+/g, "")}`;

  return (
    <div className="platform-view-section">
      <div className="platform-profile-hero">
        <div className="platform-cover-photo"></div>
        <div className="platform-profile-header-content">
          <img
            src={getAvatarUrl(currentCreator.avatarUrl)}
            className="platform-profile-avatar"
            alt={creatorName}
          />
          <div className="platform-profile-identity">
            <h1>
              {creatorName}{" "}
              <span style={{ color: "var(--platform-brand)", fontSize: "1.2rem" }}>✓</span>
            </h1>
            <div className="platform-profile-metrics">
              <span style={{ color: "var(--platform-text-main)", fontWeight: 500 }}>
                {creatorHandle}
              </span>
              <span>•</span>
              <span>Creator</span>
              <span>•</span>
              <span>{currentCreator.profileViews || 0} Profile Views</span>
            </div>
          </div>
        </div>
      </div>

      <div className="platform-profile-layout">
        {/* Left Column: About */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="platform-card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", fontWeight: 600 }}>
              About
            </h3>
            <p className="platform-about-text">
              {currentCreator.bio || `Welcome to my profile! I am sharing updates and creating open-source resources. Your support helps me keep making cool things!`}
            </p>

            <div className="platform-social-links">
              {currentCreator.twitterHandle && (
                <a href={`https://twitter.com/${twitterClean}`} target="_blank" rel="noopener noreferrer" className="platform-s-link">
                  🐦 Twitter / X (@{twitterClean})
                </a>
              )}
              {currentCreator.githubHandle && (
                <a href={`https://github.com/${githubClean}`} target="_blank" rel="noopener noreferrer" className="platform-s-link">
                  💻 GitHub (@{githubClean})
                </a>
              )}
              <a href="#" className="platform-s-link">
                🌐 Website Link
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Support & Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="platform-card platform-support-card">
            <h2>Support {creatorName.split(" ")[0]}</h2>
            <p>Choose an amount to support their creative work.</p>

            <div className="platform-amount-selector">
              {[100, 500, 1000, "Custom"].map((amount) => (
                <button
                  key={amount}
                  className={`platform-amount-btn ${selectedAmount === amount ? "active" : ""
                    }`}
                  onClick={() => handleAmountClick(amount)}
                >
                  {amount === "Custom" ? "Custom" : `₹${amount}`}
                </button>
              ))}
            </div>

            {selectedAmount === "Custom" && (
              <div className="platform-custom-input-container">
                <span>₹</span>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>
            )}

            <button className="platform-btn-primary" style={{ width: "100%" }}>
              {getButtonText()}
            </button>
          </div>

          <div className="platform-card" style={{ padding: 0 }}>
            <div className="platform-feed-card">
              <div className="platform-fc-header">
                <span className="platform-fc-title">Welcome to my profile Page! 🎉</span>
                <span className="platform-fc-time">Just now</span>
              </div>
              <p className="platform-fc-body">
                Thank you for visiting my creator profile on GetMeAChai! Feel free to support my projects using the payment widget above.
              </p>
              <div className="platform-fc-media"></div>
              <div className="platform-fc-actions">
                <span>❤️ 12</span>
                <span>💬 2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
