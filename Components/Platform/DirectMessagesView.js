"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";

export default function DirectMessagesView({ userRegion = "USA" }) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const chatEndRef = useRef(null);

  const isUSD = userRegion === "USA";

  // Fetch unique conversations / contacts
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        setIsCreator(data.isCreator || false);
        
        // Select the first conversation if none is selected
        if (data.conversations && data.conversations.length > 0 && !selectedConversation) {
          setSelectedConversation(data.conversations[0]);
        }
      }
    } catch (error) {
      console.error("Error loading DM conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async () => {
    if (!selectedConversation) return;
    setLoadingMessages(true);
    try {
      const creatorSlug = isCreator 
        ? session?.user?.name?.toLowerCase().replace(/\s+/g, "") || session?.user?.email?.split("@")[0].toLowerCase() 
        : selectedConversation.username;
      
      const supporterEmail = isCreator ? selectedConversation.email : session?.user?.email;

      const res = await fetch(`/api/messages?creator=${creatorSlug}&supporter=${supporterEmail}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        
        // Update cumulative support / tier details in real-time
        setSelectedConversation(prev => ({
          ...prev,
          cumulativeSupport: data.cumulativeSupport || prev.cumulativeSupport,
          isGoldTier: data.isGoldTier || prev.isGoldTier
        }));
      }
    } catch (error) {
      console.error("Error fetching DM messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedConversation, isCreator, session]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const creatorSlug = isCreator 
        ? session?.user?.name?.toLowerCase().replace(/\s+/g, "") || session?.user?.email?.split("@")[0].toLowerCase() 
        : selectedConversation.username;

      const supporterEmail = isCreator ? selectedConversation.email : session?.user?.email;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creator: creatorSlug,
          supporter: supporterEmail,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const activeGoldTier = selectedConversation ? selectedConversation.isGoldTier : false;

  return (
    <div className="platform-view-section" style={{ padding: 0, height: "calc(100vh - 180px)", display: "flex", background: "#09090b", border: "1px solid var(--platform-border-strong)", borderRadius: "12px", overflow: "hidden" }}>
      {/* Left Pane - Conversations List */}
      <div style={{ width: "320px", borderRight: "1px solid var(--platform-border-strong)", display: "flex", flexDirection: "column", background: "#0a0a0a" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--platform-border-strong)", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.3rem" }}>✉</span>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#fff" }}>Direct Messages</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {loadingConversations ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--platform-text-faint)", fontSize: "0.85rem" }}>
              Loading chats...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--platform-text-faint)", fontSize: "0.85rem" }}>
              {isCreator ? "No supporters have messaged you yet." : "You have not supported any creators yet."}
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = selectedConversation?.email === conv.email;
              return (
                <div
                  key={conv.email}
                  onClick={() => setSelectedConversation(conv)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    background: isActive ? "rgba(168, 85, 247, 0.1)" : "transparent",
                    border: isActive ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid transparent",
                    transition: "all 0.2s ease"
                  }}
                  className="dm-conv-item"
                >
                  <img
                    src={conv.avatarUrl || "https://i.pravatar.cc/100?img=11"}
                    alt={conv.name}
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--platform-border-subtle)" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: isActive ? "#fff" : "var(--platform-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {conv.name}
                      </span>
                      {conv.isGoldTier && (
                        <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: "rgba(234, 179, 8, 0.15)", color: "#eab308", borderRadius: "10px", fontWeight: 700 }}>
                          Gold
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--platform-text-faint)", marginTop: "2px" }}>
                      {conv.type === "creator" ? "Creator Profile" : `Supported: ${isUSD ? `$${(conv.cumulativeSupport / 83.5).toFixed(2)}` : `₹${conv.cumulativeSupport}`}`}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#070708" }}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--platform-border-strong)", display: "flex", alignItems: "center", gap: "12px", background: "#0a0a0a" }}>
              <img
                src={selectedConversation.avatarUrl}
                alt={selectedConversation.name}
                style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
              />
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "#fff" }}>{selectedConversation.name}</h3>
                <span style={{ fontSize: "0.75rem", color: "var(--platform-text-faint)" }}>
                  {selectedConversation.type === "creator" ? "Creator Channel" : `Gold Tier Supporter Status: ${selectedConversation.isGoldTier ? "Unlocked 🥇" : "Locked 🔒"}`}
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            {(!isCreator && !activeGoldTier) ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", textAlign: "center", gap: "15px" }}>
                <span style={{ fontSize: "3.5rem" }}>🔒</span>
                <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: 0 }}>Gold Tier Messaging Required</h2>
                <p style={{ fontSize: "0.9rem", color: "var(--platform-text-faint)", maxWidth: "420px", lineHeight: "1.5" }}>
                  Direct Messaging with <strong>{selectedConversation.name}</strong> is reserved for Gold Tier supporters (cumulative support of {isUSD ? "$12.00+" : "₹1,000+"}). Please support this creator to unlock direct messages!
                </p>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {loadingMessages ? (
                    <div style={{ textAlign: "center", color: "var(--platform-text-faint)", padding: "3rem" }}>
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "var(--platform-text-faint)", padding: "3rem", fontSize: "0.9rem" }}>
                      No messages in this chat yet. Send a message to start conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderEmail.toLowerCase() === session?.user?.email?.toLowerCase();
                      return (
                        <div
                          key={msg._id}
                          style={{
                            alignSelf: isMe ? "flex-end" : "flex-start",
                            background: isMe ? "var(--platform-brand)" : "rgba(255,255,255,0.06)",
                            color: "#fff",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            borderBottomRightRadius: isMe ? "2px" : "12px",
                            borderBottomLeftRadius: !isMe ? "2px" : "12px",
                            maxWidth: "60%",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px"
                          }}
                        >
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: isMe ? "rgba(255,255,255,0.8)" : "var(--platform-brand)" }}>
                            {msg.senderName}
                          </span>
                          <p style={{ fontSize: "0.85rem", margin: 0, lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                            {msg.content}
                          </p>
                          <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", alignSelf: "flex-end", marginTop: "2px" }}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input area */}
                <form onSubmit={handleSendMessage} style={{ padding: "1.25rem", borderTop: "1px solid var(--platform-border-strong)", background: "#0a0a0a", display: "flex", gap: "10px" }}>
                  <div className="platform-custom-input-container" style={{ margin: 0, flex: 1, padding: "10px 14px" }}>
                    <input
                      type="text"
                      placeholder={isCreator && !activeGoldTier ? "Supporter has not unlocked Gold Tier yet. You can still message them..." : "Type a message..."}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "var(--platform-text-main)", fontSize: "0.9rem" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="platform-btn-primary"
                    style={{ padding: "0 24px", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    Send 🚀
                  </button>
                </form>
              </div>
            )}
          </>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", color: "var(--platform-text-faint)" }}>
            <span style={{ fontSize: "3rem" }}>✉</span>
            <p style={{ marginTop: "1rem" }}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
