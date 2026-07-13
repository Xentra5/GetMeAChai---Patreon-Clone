"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import "../../app/platform/platform.css";

export default function PublicProfile({ creator }) {
  const { data: session } = useSession();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(!creator);
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [feed, setFeed] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Gated Content & Tiers state
  const [posts, setPosts] = useState([]);
  const [cumulativeSupport, setCumulativeSupport] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMinAmount, setNewPostMinAmount] = useState("0");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [showTiersModal, setShowTiersModal] = useState(false);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

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

  const currentCreator = creator || currentUser || {
    name: "User",
    email: "user@example.com",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    twitterHandle: "",
    githubHandle: "",
    monthlyGoal: 0,
    profileViews: 0,
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
  const creatorSlug = creatorName.toLowerCase().replace(/\s+/g, "");

  // Load Feed & Posts
  const fetchFeedAndPosts = React.useCallback(async () => {
    if (!creatorSlug) return;
    try {
      // 1. Fetch support messages feed
      const feedRes = await fetch(`/api/support?creator=${creatorSlug}`);
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setFeed(feedData.payments || []);
      }

      // 2. Fetch gated posts
      const postsRes = await fetch(`/api/posts?creator=${creatorSlug}`);
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
        setCumulativeSupport(postsData.cumulativeSupport || 0);
        setIsOwner(postsData.isOwner || false);
      }
    } catch (err) {
      console.error("Error loading profile content:", err);
    }
  }, [creatorSlug]);

  React.useEffect(() => {
    fetchFeedAndPosts();
  }, [fetchFeedAndPosts]);

  if (loading) {
    return (
      <div className="platform-view-section" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
  };

  const handleSupport = async () => {
    const amount = selectedAmount === "Custom" ? Number(customAmount) : Number(selectedAmount);
    if (!amount || isNaN(amount) || amount <= 0) {
      addToast("Please enter or select a valid amount.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: session?.user?.name || session?.user?.email?.split("@")[0] || "Anonymous Supporter",
          to_username: creatorSlug,
          amount: amount,
          message: supportMessage,
        }),
      });

      if (res.ok) {
        addToast(`Successfully supported with ₹${amount}!`, "success");
        setSupportMessage("");
        setCustomAmount("");
        
        // Refresh feed
        fetchFeedAndPosts();
      } else {
        const errData = await res.json();
        addToast(errData.error || "Failed to process support transaction.", "error");
      }
    } catch (err) {
      console.error("Error processing support payment:", err);
      addToast("Failed to connect to the server.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectTierFromModal = (amount) => {
    setSelectedAmount(amount);
    setShowTiersModal(false);
    const supportCard = document.querySelector(".platform-support-card");
    if (supportCard) {
      supportCard.scrollIntoView({ behavior: "smooth" });
      addToast(`Selected ₹${amount} Tier! Please write a message to support.`, "info");
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      addToast("Post title and content are required.", "error");
      return;
    }

    setSubmittingPost(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          minAmountRequired: Number(newPostMinAmount) || 0,
        }),
      });

      if (res.ok) {
        addToast("Post published successfully!", "success");
        setNewPostTitle("");
        setNewPostContent("");
        setNewPostMinAmount("0");
        fetchFeedAndPosts();
      } else {
        const errData = await res.json();
        addToast(errData.error || "Failed to publish post.", "error");
      }
    } catch (err) {
      console.error("Error publishing post:", err);
      addToast("Failed to connect to the server.", "error");
    } finally {
      setSubmittingPost(false);
    }
  };

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
        {/* Left Column: About & Tiers */}
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

          {/* Membership Tiers Card */}
          <div className="platform-card platform-card-accent-brand">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", fontWeight: 600 }}>
              Membership Tiers
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--platform-text-muted)", marginBottom: "1rem" }}>
              Unlock exclusive creator content by supporting at different levels:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--platform-border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "0.85rem" }}>
                  <span>🥉 Bronze Tier</span>
                  <span style={{ color: "var(--platform-brand)" }}>₹100+</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--platform-text-faint)", marginTop: "4px" }}>
                  Access to standard supporter updates.
                </div>
              </div>
              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--platform-border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "0.85rem" }}>
                  <span>🥈 Silver Tier</span>
                  <span style={{ color: "var(--platform-brand)" }}>₹500+</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--platform-text-faint)", marginTop: "4px" }}>
                  Access to behind-the-scenes progress updates.
                </div>
              </div>
              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--platform-border-subtle)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "0.85rem" }}>
                  <span>🥇 Gold Tier</span>
                  <span style={{ color: "var(--platform-brand)" }}>₹1000+</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--platform-text-faint)", marginTop: "4px" }}>
                  Access to priority posts & private repository links.
                </div>
              </div>
            </div>
            {cumulativeSupport > 0 && (
              <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--platform-success)", fontWeight: 600 }}>
                ✓ Cumulative Support: ₹{cumulativeSupport}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Support & Feed */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Creator Post Composing Panel */}
          {isOwner && (
            <div className="platform-card platform-card-accent-brand">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "12px", fontWeight: 600 }}>
                Publish Creator Update
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className="platform-custom-input-container" style={{ margin: 0 }}>
                  <input
                    type="text"
                    placeholder="Update Title"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--platform-text-main)", fontSize: "0.9rem" }}
                  />
                </div>
                <div className="platform-custom-input-container" style={{ margin: 0, padding: "8px 10px" }}>
                  <textarea
                    placeholder="Write your exclusive update content here..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--platform-text-main)", minHeight: "80px", resize: "vertical", fontSize: "0.9rem", fontFamily: "inherit" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--platform-text-muted)" }}>Gated At:</label>
                    <select
                      value={newPostMinAmount}
                      onChange={(e) => setNewPostMinAmount(e.target.value)}
                      style={{ background: "#111", border: "1px solid var(--platform-border-strong)", borderRadius: "4px", color: "var(--platform-text-main)", fontSize: "0.8rem", padding: "4px 8px" }}
                    >
                      <option value="0">Public (₹0)</option>
                      <option value="100">🥉 Bronze Tier (₹100+)</option>
                      <option value="500">🥈 Silver Tier (₹500+)</option>
                      <option value="1000">🥇 Gold Tier (₹1000+)</option>
                    </select>
                  </div>
                  <button 
                    className="platform-btn-primary" 
                    onClick={handleCreatePost}
                    disabled={submittingPost}
                    style={{ padding: "8px 16px", fontSize: "0.8rem" }}
                  >
                    {submittingPost ? "Publishing..." : "Publish Post"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="platform-card platform-support-card">
            <h2>Support {creatorName.split(" ")[0]}</h2>
            <p>Choose an amount and leave a friendly message.</p>

            <div className="platform-custom-input-container" style={{ marginTop: "1.25rem", marginBottom: "0.75rem" }}>
              <input
                type="text"
                placeholder="Say something nice..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--platform-text-main)" }}
              />
            </div>

            <div className="platform-amount-selector">
              {[100, 500, 1000, "Custom"].map((amount) => (
                <button
                  key={amount}
                  className={`platform-amount-btn ${selectedAmount === amount ? "active" : ""}`}
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
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--platform-text-main)" }}
                />
              </div>
            )}

            <button 
              className="platform-btn-primary" 
              style={{ width: "100%" }}
              onClick={handleSupport}
              disabled={submitting}
            >
              {submitting ? "Processing..." : getButtonText()}
            </button>
          </div>

          {/* Creator Updates */}
          <div className="platform-card" style={{ padding: 0 }}>
            <h3 style={{ fontSize: "1.1rem", padding: "1.5rem 1.5rem 0.5rem 1.5rem", fontWeight: 600 }}>
              Creator Updates
            </h3>
            {posts.length === 0 ? (
              <div style={{ padding: "1.5rem", color: "var(--platform-text-faint)", fontSize: "0.9rem" }}>
                No updates published yet by the creator.
              </div>
            ) : (
              posts.map((post) => (
                <div 
                  key={post._id} 
                  className="platform-feed-card" 
                  style={{ 
                    borderLeft: post.isLocked ? "3px solid var(--platform-warning)" : "3px solid var(--platform-success)",
                    cursor: post.isLocked ? "pointer" : "default" 
                  }}
                  onClick={post.isLocked ? () => setShowTiersModal(true) : undefined}
                >
                  <div className="platform-fc-header">
                    <span className="platform-fc-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {post.isLocked ? "🔒" : "🔓"} {post.title}
                    </span>
                    <span className="platform-fc-time">
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="platform-fc-body" style={{ color: post.isLocked ? "var(--platform-text-faint)" : "var(--platform-text-muted)" }}>
                    {post.content}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                    <span style={{ color: post.isLocked ? "var(--platform-warning)" : "var(--platform-success)", fontWeight: 500 }}>
                      {post.minAmountRequired === 0 ? "Public Post" : `Requires ₹${post.minAmountRequired}+ Support`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="platform-card" style={{ padding: 0 }}>
            <h3 style={{ fontSize: "1.1rem", padding: "1.5rem 1.5rem 0.5rem 1.5rem", fontWeight: 600 }}>
              Supporter Messages
            </h3>
            {feed.length === 0 ? (
              <div style={{ padding: "1.5rem", color: "var(--platform-text-faint)", fontSize: "0.9rem" }}>
                No support messages yet. Be the first to support!
              </div>
            ) : (
              feed.map((item) => {
                const isLockedMsg = item.message?.includes("🔒");
                return (
                  <div 
                    key={item._id} 
                    className="platform-feed-card"
                    style={{ cursor: isLockedMsg ? "pointer" : "default" }}
                    onClick={isLockedMsg ? () => setShowTiersModal(true) : undefined}
                  >
                    <div className="platform-fc-header">
                      <span className="platform-fc-title">{item.name}</span>
                      <span className="platform-fc-time">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="platform-fc-body">
                      {item.message || "Supported the creator! ☕"}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
                      <span style={{ color: "var(--platform-brand)", fontWeight: 600 }}>
                        Bought Chai (₹{item.amount})
                      </span>
                      <span style={{ color: "var(--platform-text-faint)" }}>❤️ Verified</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3-Tier Membership Modal */}
      {showTiersModal && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0, 0, 0, 0.8)", zIndex: 1100 }}>
          <div className="platform-card" style={{ maxWidth: "480px", width: "90%", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Choose a Membership Tier</h2>
              <button 
                onClick={() => setShowTiersModal(false)}
                style={{ background: "none", border: "none", color: "var(--platform-text-faint)", fontSize: "1.5rem", cursor: "pointer" }}
              >
                &times;
              </button>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--platform-text-muted)" }}>
              Support this creator to unlock updates, links, and access the exclusive Supporter Feed.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div 
                onClick={() => handleSelectTierFromModal(100)}
                style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--platform-border-subtle)", cursor: "pointer", transition: "var(--platform-transition)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "0.95rem" }}>
                  <span>🥉 Bronze Tier</span>
                  <span style={{ color: "var(--platform-brand)" }}>₹100</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--platform-text-faint)", marginTop: "6px" }}>
                  Unlock supporter updates and public message boards.
                </div>
              </div>

              <div 
                onClick={() => handleSelectTierFromModal(500)}
                style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--platform-border-subtle)", cursor: "pointer", transition: "var(--platform-transition)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "0.95rem" }}>
                  <span>🥈 Silver Tier</span>
                  <span style={{ color: "var(--platform-brand)" }}>₹500</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--platform-text-faint)", marginTop: "6px" }}>
                  Access behind-the-scenes progress posts.
                </div>
              </div>

              <div 
                onClick={() => handleSelectTierFromModal(1000)}
                style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--platform-border-subtle)", cursor: "pointer", transition: "var(--platform-transition)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "0.95rem" }}>
                  <span>🥇 Gold Tier</span>
                  <span style={{ color: "var(--platform-brand)" }}>₹1000</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--platform-text-faint)", marginTop: "6px" }}>
                  Priority direct messages & private GitHub/repository links.
                </div>
              </div>
            </div>
            <button 
              className="platform-btn-outline" 
              onClick={() => setShowTiersModal(false)}
              style={{ justifyContent: "center" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
