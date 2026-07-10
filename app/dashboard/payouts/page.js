"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Search,
  Download,
  LogOut
} from "lucide-react";
import "../dashboard.css";

export default function Payouts() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("Stripe Bank Transfer (****4821)");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [timeFilter, setTimeFilter] = useState("Last 30 Days");

  // Animate counter values
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingClearance, setPendingClearance] = useState(0);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch Payouts data
  const fetchPayouts = async () => {
    try {
      const response = await fetch("/api/dashboard/payouts");
      if (response.ok) {
        const resData = await response.json();
        setData(resData);
      } else {
        console.error("Failed to fetch payouts stats");
      }
    } catch (error) {
      console.error("Error fetching payouts stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchPayouts();
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

    setAvailableBalance(0);
    setPendingClearance(0);
    setTotalWithdrawn(0);

    animateValue(setAvailableBalance, 0, data.availableBalance, 1200);
    animateValue(setPendingClearance, 0, data.pendingClearance, 1200);
    animateValue(setTotalWithdrawn, 0, data.totalWithdrawn, 1200);
  }, [data]);

  // Handle Withdraw submission
  const handleWithdrawSubmit = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 1000) {
      alert("Minimum withdrawal amount is ₹1,000.");
      return;
    }
    if (amount > data.availableBalance) {
      alert("Insufficient funds. You cannot withdraw more than your available balance.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/payouts/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: withdrawMethod.replace(/\s*\(.*\)/g, ""), // clean label
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setWithdrawAmount("");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        // Refresh stats
        await fetchPayouts();
      } else {
        const errData = await res.json();
        alert(errData.error || "Withdrawal failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Error sending withdrawal request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter history
  const filteredHistory = data?.history.filter((tx) => {
    // 1. Status Filter
    if (statusFilter !== "All Statuses") {
      if (statusFilter === "Completed" && tx.status !== "completed" && tx.status !== "success") return false;
      if (statusFilter === "Pending" && tx.status !== "pending") return false;
      if (statusFilter === "Failed" && tx.status !== "failed") return false;
    }

    // 2. Time Filter (simple mock filter logic)
    const txDate = new Date(tx.createdAt);
    const now = new Date();
    const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);

    if (timeFilter === "Last 30 Days" && diffDays > 30) return false;
    if (timeFilter === "Last 3 Months" && diffDays > 90) return false;

    return true;
  }) || [];

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Loading payouts system...</p>
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
          <Link href="/dashboard/payouts" className="nav-item active">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-400" />
              Revenue & Payouts
            </span>
          </Link>
          <Link href="/dashboard/audience-insights" className="nav-item">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Audience Insights
            </span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="header">
          <button className="search-trigger">
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search transactions...
            </span>
            <span className="kbd">⌘K</span>
          </button>
          <div className="header-actions">
            <button className="btn-export">Documentation</button>
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
          <div className="page-title">
            <h1 style={{ fontSize: "1.8rem", fontWeight: "600", letterSpacing: "-0.03em", marginBottom: "6px" }}>
              Payouts
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Manage your earnings, payment methods, and withdrawal history.
            </p>
          </div>

          {/* BALANCE SUMMARY */}
          <div className="balance-grid">
            <div className="card c-primary">
              <div className="card-title">Available Balance</div>
              <div className="card-value txt-success">₹{Math.floor(availableBalance).toLocaleString("en-IN")}</div>
              <div className="card-desc">Funds ready to be withdrawn to your bank.</div>
              <button className="btn-brand" onClick={() => setIsModalOpen(true)} style={{ marginTop: "1.5rem" }}>
                Withdraw Funds
              </button>
            </div>
            <div className="card">
              <div className="card-title">Pending Clearance</div>
              <div className="card-value txt-warning">₹{Math.floor(pendingClearance).toLocaleString("en-IN")}</div>
              <div className="card-desc">Recent support currently being processed by banks.</div>
              <div className="card-desc txt-muted" style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-faint)", fontSize: "0.8rem" }}>
                Clears in 3 days.
              </div>
            </div>
            <div className="card">
              <div className="card-title">Total Withdrawn</div>
              <div className="card-value">₹{Math.floor(totalWithdrawn).toLocaleString("en-IN")}</div>
              <div className="card-desc">Lifetime earnings transferred to your accounts.</div>
              <div className="card-desc" style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-faint)", fontSize: "0.8rem" }}>
                <a href="#" style={{ color: "var(--text-main)", textDecoration: "none" }}>
                  View tax documents →
                </a>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION (Methods & Schedule) */}
          <div className="middle-grid">
            {/* Connected Methods */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Connected Methods</h2>
                <button className="btn-outline">+ Add Method</button>
              </div>

              <div className="methods-list">
                {/* Stripe */}
                <div className="method-item">
                  <div className="method-left">
                    <div className="method-icon" style={{ color: "#6366f1" }}>
                      S
                    </div>
                    <div className="method-info">
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                        Stripe Bank Transfer <span className="badge badge-default">Default</span>
                      </h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        HDFC Bank ending in ****4821
                      </p>
                    </div>
                  </div>
                  <button className="btn-outline">Manage</button>
                </div>

                {/* PayPal */}
                <div className="method-item">
                  <div className="method-left">
                    <div className="method-icon" style={{ color: "#3b82f6" }}>
                      P
                    </div>
                    <div className="method-info">
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>PayPal Account</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        {data.email}
                      </p>
                    </div>
                  </div>
                  <button className="btn-outline">Manage</button>
                </div>

                {/* Crypto */}
                <div className="method-item" style={{ borderStyle: "dashed", opacity: 0.7 }}>
                  <div className="method-left">
                    <div className="method-icon" style={{ color: "var(--text-faint)" }}>
                      C
                    </div>
                    <div className="method-info">
                      <h4 style={{ fontSize: "0.95rem", fontWeight: "600" }}>Crypto Wallet</h4>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                        Receive USDC via Polygon network
                      </p>
                    </div>
                  </div>
                  <button className="btn-outline" style={{ borderColor: "var(--brand)", color: "var(--brand)" }}>
                    Connect
                  </button>
                </div>
              </div>
            </div>

            {/* Payout Schedule */}
            <div className="card">
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem" }}>Payout Schedule</h2>
              <div className="schedule-box">
                <p className="txt-muted" style={{ fontSize: "0.9rem" }}>
                  Next automatic payout
                </p>
                <div className="s-date">Friday, Oct 25</div>
                <p className="txt-muted" style={{ fontSize: "0.85rem" }}>
                  Processing time: 1-2 business days
                </p>
              </div>
              <div className="progress-container">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <span>Minimum threshold: ₹1000</span>
                  <span className="txt-success fw-600">Met</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill"></div>
                </div>
              </div>
            </div>
          </div>

          {/* TRANSACTION TABLE */}
          <div className="table-container">
            <div className="table-header">
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Transaction History</h2>
              <div className="table-filters">
                <select className="select-input dropdown" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Statuses</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
                <select className="select-input dropdown" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>This Year</option>
                </select>
                <button className="btn-outline">📥 Export CSV</button>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description / Supporter</th>
                  <th>Payout Method</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((tx) => (
                    <tr key={tx.id}>
                      <td>{tx.date}</td>
                      <td>
                        <div className="t-supporter">
                          <div
                            className="t-avatar"
                            style={{
                              background: tx.type === "debit" ? "transparent" : "#ec4899",
                              border: tx.type === "debit" ? "1px solid var(--border-strong)" : "none",
                            }}
                          ></div>
                          {tx.description}
                        </div>
                      </td>
                      <td className="txt-muted">{tx.method}</td>
                      <td>
                        <span
                          className={`status ${
                            tx.status === "completed" || tx.status === "success"
                              ? "s-completed"
                              : tx.status === "pending"
                              ? "s-pending"
                              : "s-failed"
                          }`}
                        >
                          {tx.status === "completed" || tx.status === "success"
                            ? "Completed"
                            : tx.status === "pending"
                            ? "Processing"
                            : "Failed"}
                        </span>
                      </td>
                      <td
                        style={{ textAlign: "right" }}
                        className={`t-amount ${tx.type === "credit" ? "txt-success" : "txt-muted"}`}
                      >
                        {tx.type === "credit" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>
                      No transaction history found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* WITHDRAWAL MODAL */}
      {isModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Withdraw Funds</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  background: "var(--bg-base)",
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="txt-muted" style={{ fontSize: "0.85rem" }}>
                  Available Balance
                </span>
                <span className="txt-success fw-600">₹{Math.floor(data.availableBalance).toLocaleString("en-IN")}</span>
              </div>

              <div className="form-group">
                <label>Amount to withdraw</label>
                <div className="input-wrapper">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    className="text-input"
                    placeholder="0.00"
                    min="1000"
                    max={data.availableBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <button className="btn-max" onClick={() => setWithdrawAmount(data.availableBalance)}>
                    Max
                  </button>
                </div>
                <span className="txt-muted" style={{ fontSize: "0.75rem", marginTop: "6px", display: "inline-block" }}>
                  Minimum withdrawal is ₹1,000.
                </span>
              </div>

              <div className="form-group">
                <label>Transfer to</label>
                <select
                  className="text-input"
                  style={{ paddingLeft: "16px", appearance: "none" }}
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                >
                  <option>Stripe Bank Transfer (****4821)</option>
                  <option>PayPal ({data.email})</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-brand" disabled={isSubmitting} onClick={handleWithdrawSubmit}>
                {isSubmitting ? (
                  <div className="loader" style={{ display: "block" }}></div>
                ) : (
                  <span>Confirm Withdrawal</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${showToast ? "show" : ""}`}>
        <span>✓</span> Withdrawal request submitted successfully!
      </div>
    </div>
  );
}
