"use client";

import React, { useState, useEffect } from "react";
import "../../app/platform/platform.css";

export default function SearchCreators({ onSelectProfile }) {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("views");

  const categories = ["All", "Design", "Engineering", "Writing", "Video"];

  async function getCreators() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("q", searchQuery.trim());
      }
      if (activeCategory !== "All") {
        params.append("category", activeCategory);
      }
      params.append("sortBy", sortBy);

      const response = await fetch(`/api/creators?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCreators(data);
      }
    } catch (error) {
      console.error("Error loading creators:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fetch real creators when category or sort option changes
  useEffect(() => {
    getCreators();
  }, [activeCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    getCreators();
  };

  return (
    <div className="platform-view-section">
      <div className="platform-search-hero">
        <h1>Discover Creators</h1>
        <form onSubmit={handleSearchSubmit} className="platform-big-search-box">
          <input
            type="text"
            placeholder="Search by name, handle, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: "#111",
              border: "1px solid var(--platform-border-input)",
              color: "var(--platform-text-main)",
              borderRadius: "4px",
              padding: "8px 12px",
              marginRight: "8px",
              fontSize: "0.85rem",
              outline: "none"
            }}
          >
            <option value="views">Sort by: Popularity</option>
            <option value="name">Sort by: Name (A-Z)</option>
            <option value="goal">Sort by: Funding Goal</option>
          </select>
          <button type="submit" className="platform-btn-search">Search</button>
        </form>
        <div className="platform-filter-ribbon">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`platform-filter-pill ${
                activeCategory === cat ? "active" : ""
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="platform-creator-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="platform-card platform-shimmer-card">
              <div className="platform-shimmer-item" style={{ height: "40px", width: "40px", borderRadius: "50%", marginBottom: "1rem" }} />
              <div className="platform-shimmer-item" style={{ height: "18px", width: "70%", marginBottom: "0.5rem" }} />
              <div className="platform-shimmer-item" style={{ height: "14px", width: "90%", marginBottom: "1.5rem" }} />
              <div className="platform-shimmer-item" style={{ height: "30px", width: "100%" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="platform-creator-grid">
          {creators.length > 0 ? (
            creators.map((creator, index) => {
              // Accent borders cycle
              const accentClasses = [
                "platform-card-accent-brand",
                "platform-card-accent-info",
                "platform-card-accent-warning",
              ];
              const accentClass = accentClasses[index % accentClasses.length];

              const creatorName = creator.name || creator.email.split("@")[0];
              const twitterClean = creator.twitterHandle ? creator.twitterHandle.replace("@", "") : "";
              const githubClean = creator.githubHandle ? creator.githubHandle.replace("@", "") : "";
              const creatorHandle = `@${twitterClean || githubClean || creatorName.toLowerCase().replace(/\s+/g, "")}`;

              const getAvatarUrl = (url) => {
                if (!url || url.includes("img=11")) {
                  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23a855f7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>`;
                }
                return url;
              };

              return (
                <div
                  key={creator._id}
                  className={`platform-creator-card ${accentClass}`}
                  onClick={() => onSelectProfile && onSelectProfile(creator)}
                >
                  <div className="platform-cc-header">
                    <img
                      src={getAvatarUrl(creator.avatarUrl)}
                      className="platform-cc-avatar"
                      alt={creatorName}
                    />
                    <div className="platform-cc-info">
                      <h3>{creatorName}</h3>
                      <p>{creatorHandle}</p>
                    </div>
                  </div>
                  <p className="platform-cc-bio">
                    {creator.bio || `Creative ${creator.category || "designer"} sharing updates and digital content on GetMeAChai.`}
                  </p>
                  <div className="platform-cc-footer">
                    <span className="platform-cc-stats">
                      {creator.profileViews || 0} Profile Views
                    </span>
                    <span className="platform-cc-link">View Profile →</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: "var(--platform-text-faint)", gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
              No registered creators match your criteria yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
