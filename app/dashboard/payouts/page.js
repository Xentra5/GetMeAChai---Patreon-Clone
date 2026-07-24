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
  LogOut,
  Compass,
  User,
  Settings,
  Building2,
  Wallet,
  Coins,
  Send,
  CreditCard,
  Globe,
  MapPin,
  MessageSquare
} from "lucide-react";
import Sidebar from "@/Components/Sidebar";
import "../dashboard.css";

export default function Payouts() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect students to /dashboard/wallet
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userAccountType");
      if (storedRole && storedRole.toLowerCase() === "student") {
        router.replace("/dashboard/wallet");
        return;
      }
    }
    if (status === "authenticated") {
      fetch("/api/user/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.role && data.role.toLowerCase() === "student") {
            router.replace("/dashboard/wallet");
          }
        })
        .catch(() => {});
    }
  }, [status, router]);

  // States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Region & Localisation State: "USA" (USD) or "IND" (INR)
  const [userRegion, setUserRegion] = useState("USA");
  const usdToInrRate = 83.5;
  const isUSD = userRegion === "USA";

  // Load region from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userRegion");
      if (saved) {
        setUserRegion(saved);
      }
    }
  }, []);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [payoutMethods, setPayoutMethods] = useState([]);

  // Payout schedule dynamic states
  const [scheduleNextDate, setScheduleNextDate] = useState("Friday, Oct 25");
  const [scheduleProcessingTime, setScheduleProcessingTime] = useState("1-2 business days");
  const [scheduleThreshold, setScheduleThreshold] = useState(1000);

  useEffect(() => {
    if (data) {
      if (data.payoutNextDate) setScheduleNextDate(data.payoutNextDate);
      if (data.payoutProcessingTime) setScheduleProcessingTime(data.payoutProcessingTime);
      if (data.payoutMinimumThreshold !== undefined) setScheduleThreshold(data.payoutMinimumThreshold);
    }
  }, [data]);

  const handleSaveScheduleModal = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutNextDate: scheduleNextDate,
          payoutProcessingTime: scheduleProcessingTime,
          payoutMinimumThreshold: Number(scheduleThreshold),
        }),
      });
      if (response.ok) {
        setIsScheduleModalOpen(false);
        await fetchPayouts();
      } else {
        alert("Failed to update payout schedule settings.");
      }
    } catch (err) {
      console.error("Save schedule error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format payout methods dynamically
  const getFormattedMethodName = (method) => {
    if (method.methodType === "bank") {
      return `Bank Transfer (${method.details.bankName} - ****${method.details.accountNumber.slice(-4)})`;
    }
    if (method.methodType === "upi") {
      return `UPI (${method.details.upiId})`;
    }
    if (method.methodType === "paypal") {
      return `PayPal (${method.details.email})`;
    }
    if (method.methodType === "stripe") {
      return `Stripe (${method.details.accountId})`;
    }
    if (method.methodType === "wise") {
      return `Wise (${method.details.email || method.details.memberId})`;
    }
    if (method.methodType === "payoneer") {
      return `Payoneer (${method.details.email || method.details.payeeId})`;
    }
    if (method.methodType === "wire") {
      return `Wire Transfer (${method.details.bankName} - ****${method.details.iban.slice(-4)})`;
    }
    if (method.methodType === "crypto") {
      return `Crypto (${method.details.walletAddress.slice(0, 6)}...${method.details.walletAddress.slice(-4)})`;
    }
    return method.methodType;
  };

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

  const fetchPayoutMethods = async () => {
    try {
      const response = await fetch("/api/dashboard/payouts/methods");
      if (response.ok) {
        const resData = await response.json();
        setPayoutMethods(resData.methods || []);
        const defaultMethod = resData.methods?.find((m) => m.isDefault);
        if (defaultMethod) {
          setWithdrawMethod(getFormattedMethodName(defaultMethod));
        } else if (resData.methods?.length > 0) {
          setWithdrawMethod(getFormattedMethodName(resData.methods[0]));
        } else {
          setWithdrawMethod("");
        }
      }
    } catch (error) {
      console.error("Error fetching payout methods:", error);
    }
  };

  const handleMakeDefault = async (id) => {
    try {
      const response = await fetch(`/api/dashboard/payouts/methods/${id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        await fetchPayoutMethods();
      } else {
        alert("Failed to set default method.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteMethod = async (id) => {
    if (!confirm("Are you sure you want to delete this payout method?")) return;
    try {
      const response = await fetch(`/api/dashboard/payouts/methods/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchPayoutMethods();
      } else {
        alert("Failed to delete payout method.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchPayouts();
    fetchPayoutMethods();
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

    const isUSD = userRegion === "USA";
    const avBal = isUSD ? data.availableBalance / usdToInrRate : data.availableBalance;
    const pendClr = isUSD ? data.pendingClearance / usdToInrRate : data.pendingClearance;
    const totWd = isUSD ? data.totalWithdrawn / usdToInrRate : data.totalWithdrawn;

    animateValue(setAvailableBalance, 0, avBal, 1200);
    animateValue(setPendingClearance, 0, pendClr, 1200);
    animateValue(setTotalWithdrawn, 0, totWd, 1200);
  }, [data, userRegion]);

  // Handle Withdraw submission
  const handleWithdrawSubmit = async () => {
    const isUSD = userRegion === "USA";
    const amount = Number(withdrawAmount);
    const minAmount = isUSD ? 12 : 1000;
    
    if (!amount || amount < minAmount) {
      alert(`Minimum withdrawal amount is ${isUSD ? "$12.00" : "₹1,000"}.`);
      return;
    }
    const maxBalance = isUSD ? data.availableBalance / usdToInrRate : data.availableBalance;
    if (amount > maxBalance) {
      alert("Insufficient funds. You cannot withdraw more than your available balance.");
      return;
    }
    if (!withdrawMethod) {
      alert("Please select or connect a payout method first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/payouts/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: isUSD ? amount * usdToInrRate : amount,
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
      <Sidebar activeTab="payouts" />

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
              <div className="card-title">Available Balance ({isUSD ? "USD" : "INR"})</div>
              <div className="card-value txt-success">
                {isUSD ? "$" : "₹"}{availableBalance.toLocaleString(isUSD ? "en-US" : "en-IN", { minimumFractionDigits: isUSD ? 2 : 0, maximumFractionDigits: isUSD ? 2 : 0 })}
              </div>
              <div className="card-desc">Funds ready to be withdrawn to your bank.</div>
              <button className="btn-brand" onClick={() => setIsModalOpen(true)} style={{ marginTop: "1.5rem" }}>
                Withdraw Funds
              </button>
            </div>
            <div className="card">
              <div className="card-title">Pending Clearance</div>
              <div className="card-value txt-warning">
                {isUSD ? "$" : "₹"}{pendingClearance.toLocaleString(isUSD ? "en-US" : "en-IN", { minimumFractionDigits: isUSD ? 2 : 0, maximumFractionDigits: isUSD ? 2 : 0 })}
              </div>
              <div className="card-desc">Recent support currently being processed by banks.</div>
              <div className="card-desc txt-muted" style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-faint)", fontSize: "0.8rem" }}>
                Clears in 3 days.
              </div>
            </div>
            <div className="card">
              <div className="card-title">Total Withdrawn</div>
              <div className="card-value">
                {isUSD ? "$" : "₹"}{totalWithdrawn.toLocaleString(isUSD ? "en-US" : "en-IN", { minimumFractionDigits: isUSD ? 2 : 0, maximumFractionDigits: isUSD ? 2 : 0 })}
              </div>
              <div className="card-desc">Lifetime earnings transferred to your accounts.</div>
              <div className="card-desc" style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border-faint)", fontSize: "0.8rem" }}>
                <button
                  onClick={() => setIsTaxModalOpen(true)}
                  style={{ color: "var(--text-main)", textDecoration: "none", background: "none", border: "none", padding: 0, font: "inherit", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                >
                  View tax documents →
                </button>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION (Methods & Schedule) */}
          <div className="middle-grid">
            {/* Connected Methods */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Connected Methods</h2>
                <Link href="/dashboard/payouts/add" className="btn-outline" style={{ textDecoration: "none" }}>
                  + Add Method
                </Link>
              </div>

              <div className="methods-list" style={{ marginTop: "1rem" }}>
                {payoutMethods.length > 0 ? (
                  payoutMethods.map((method) => {
                    let iconElement = null;
                    let iconColor = "#8b5cf6";
                    let title = method.methodType.toUpperCase();
                    let desc = "";

                    if (method.methodType === "bank") {
                      iconElement = <Building2 className="w-5 h-5" />;
                      iconColor = "#10b981";
                      title = "Bank Account";
                      desc = `${method.details.bankName} (****${method.details.accountNumber.slice(-4)})`;
                    } else if (method.methodType === "upi") {
                      iconElement = <Send className="w-5 h-5" />;
                      iconColor = "#f59e0b";
                      title = "UPI";
                      desc = method.details.upiId;
                    } else if (method.methodType === "paypal") {
                      iconElement = <Wallet className="w-5 h-5" />;
                      iconColor = "#00b9ff";
                      title = "PayPal";
                      desc = method.details.email;
                    } else if (method.methodType === "stripe") {
                      iconElement = <CreditCard className="w-5 h-5" />;
                      iconColor = "#635bff";
                      title = "Stripe Connect";
                      desc = method.details.accountId;
                    } else if (method.methodType === "wise") {
                      iconElement = <Globe className="w-5 h-5" />;
                      iconColor = "#00b9ff";
                      title = "Wise";
                      desc = method.details.email || method.details.memberId;
                    } else if (method.methodType === "payoneer") {
                      iconElement = <CreditCard className="w-5 h-5" />;
                      iconColor = "#ff4f00";
                      title = "Payoneer";
                      desc = method.details.email || method.details.payeeId;
                    } else if (method.methodType === "wire") {
                      iconElement = <Building2 className="w-5 h-5" />;
                      iconColor = "#a1a1aa";
                      title = "International Wire";
                      desc = `${method.details.bankName} (****${method.details.iban.slice(-4)})`;
                    } else if (method.methodType === "crypto") {
                      iconElement = <Coins className="w-5 h-5" />;
                      iconColor = "#ec4899";
                      title = "Crypto Wallet (USDC)";
                      desc = `Polygon (${method.details.walletAddress.slice(0, 6)}...${method.details.walletAddress.slice(-4)})`;
                    }

                    return (
                      <div className="method-item" key={method._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid var(--border-faint)" }}>
                        <div className="method-left" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div
                            className="method-icon"
                            style={{
                              backgroundColor: "rgba(255, 255, 255, 0.03)",
                              border: "1px solid var(--border-subtle)",
                              color: iconColor,
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {iconElement}
                          </div>
                          <div className="method-info">
                            <h4 style={{ fontSize: "0.95rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
                              {title} {method.isDefault && <span className="badge badge-default" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px" }}>Default</span>}
                            </h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px", margin: 0 }}>
                              {desc}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {!method.isDefault && (
                            <button
                              onClick={() => handleMakeDefault(method._id)}
                              className="btn-outline"
                              style={{ fontSize: "0.8rem", padding: "4px 8px" }}
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMethod(method._id)}
                            className="btn-outline"
                            style={{ fontSize: "0.8rem", padding: "4px 8px", borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171" }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-muted)" }}>
                    <p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem" }}>No payout methods connected yet.</p>
                    <Link href="/dashboard/payouts/add" className="btn-brand" style={{ textDecoration: "none", fontSize: "0.85rem", padding: "6px 12px" }}>
                      Connect Method
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Payout Schedule */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "600", margin: 0 }}>Payout Schedule</h2>
                <button 
                  className="btn-outline" 
                  onClick={() => setIsScheduleModalOpen(true)}
                  style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                >
                  Edit Schedule ⚙️
                </button>
              </div>
              <div className="schedule-box">
                <p className="txt-muted" style={{ fontSize: "0.9rem" }}>
                  Next automatic payout
                </p>
                <div className="s-date">{data?.payoutNextDate || scheduleNextDate}</div>
                <p className="txt-muted" style={{ fontSize: "0.85rem" }}>
                  Processing time: {data?.payoutProcessingTime || scheduleProcessingTime}
                </p>
              </div>
              <div className="progress-container">
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  <span>Minimum threshold: ₹{data?.payoutMinimumThreshold ?? scheduleThreshold}</span>
                  {availableBalance >= (data?.payoutMinimumThreshold ?? scheduleThreshold) ? (
                    <span className="txt-success fw-600">Met</span>
                  ) : (
                    <span className="txt-muted fw-600">{Math.min(100, Math.round((availableBalance / (data?.payoutMinimumThreshold ?? scheduleThreshold)) * 100))}%</span>
                  )}
                </div>
                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${Math.min(100, Math.round((availableBalance / (data?.payoutMinimumThreshold ?? scheduleThreshold)) * 100))}%` }}
                  ></div>
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
                        {tx.type === "credit" ? "+" : "-"}{isUSD ? "$" : "₹"}{(tx.amount / (isUSD ? usdToInrRate : 1)).toLocaleString(isUSD ? "en-US" : "en-IN", { minimumFractionDigits: isUSD ? 2 : 0, maximumFractionDigits: isUSD ? 2 : 0 })}
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
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px",
                  background: "var(--bg-base)",
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
                <span className="txt-success fw-600">
                  {isUSD ? "$" : "₹"}{(data.availableBalance / (isUSD ? usdToInrRate : 1)).toLocaleString(isUSD ? "en-US" : "en-IN", { minimumFractionDigits: isUSD ? 2 : 0, maximumFractionDigits: isUSD ? 2 : 0 })}
                </span>
              </div>

              <div className="form-group">
                <label>Amount to withdraw</label>
                <div className="input-wrapper">
                  <span className="input-prefix">{isUSD ? "$" : "₹"}</span>
                  <input
                    type="number"
                    className="text-input"
                    placeholder="0.00"
                    min={isUSD ? "12" : "1000"}
                    max={isUSD ? data.availableBalance / usdToInrRate : data.availableBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <button className="btn-max" onClick={() => setWithdrawAmount(isUSD ? (data.availableBalance / usdToInrRate).toFixed(2) : data.availableBalance)}>
                    Max
                  </button>
                </div>
                <span className="txt-muted" style={{ fontSize: "0.75rem", marginTop: "6px", display: "inline-block" }}>
                  Minimum withdrawal is {isUSD ? "$12.00" : "₹1,000"}.
                </span>
              </div>

              <div className="form-group">
                <label>Transfer to</label>
                {payoutMethods.length > 0 ? (
                  <select
                    className="text-input"
                    style={{ paddingLeft: "16px", appearance: "none" }}
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                  >
                    {payoutMethods.map((method) => (
                      <option key={method._id} value={getFormattedMethodName(method)}>
                        {getFormattedMethodName(method)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: "10px", fontSize: "0.85rem", color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)" }}>
                    No payment methods connected. Please{" "}
                    <Link href="/dashboard/payouts/add" style={{ color: "var(--brand)", textDecoration: "underline" }}>
                      add a method
                    </Link>{" "}
                    first.
                  </div>
                )}
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

      {/* MOCK TAX DOCUMENT MODAL */}
      {isTaxModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsTaxModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px", width: "90%" }}>
            <div className="modal-header" style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem" }}>
              <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>📄</span> Mock Tax Statement (FY 2025-26)
              </h3>
              <button className="close-btn" onClick={() => setIsTaxModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body" id="tax-document-print" style={{ color: "#000", background: "#fff", padding: "2rem", borderRadius: "8px", fontFamily: "Courier New, monospace", marginTop: "1rem" }}>
              <div style={{ textAlign: "center", marginBottom: "1.5rem", borderBottom: "2px double #000", paddingBottom: "1rem" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: "bold", margin: 0, letterSpacing: "1px" }}>FORM 16A (SIMULATED)</h2>
                <p style={{ fontSize: "0.8rem", margin: "4px 0" }}>Certificate of Tax Deducted at Source (TDS) under Section 203</p>
                <p style={{ fontSize: "0.85rem", fontWeight: "bold", margin: 0 }}>GetMeAChai India Private Limited</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.8rem", marginBottom: "1.5rem", borderBottom: "1px solid #ccc", paddingBottom: "1rem" }}>
                <div>
                  <strong>Deductor Info:</strong><br />
                  GetMeAChai India Pvt. Ltd.<br />
                  TAN: BLRG09823C<br />
                  PAN: AABCG9982M
                </div>
                <div>
                  <strong>Deductee Info (Creator):</strong><br />
                  Name: {data.username}<br />
                  Email: {data.email}<br />
                  PAN: XXXX9988X (Mocked)
                </div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #000" }}>
                    <th style={{ textAlign: "left", padding: "6px" }}>Period</th>
                    <th style={{ textAlign: "left", padding: "6px" }}>Section</th>
                    <th style={{ textAlign: "right", padding: "6px" }}>Gross Earnings</th>
                    <th style={{ textAlign: "right", padding: "6px" }}>TDS Withheld (1%)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 6px" }}>Q1 (Apr-Jun)</td>
                    <td style={{ padding: "8px 6px" }}>194-S</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.25).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.25 * 0.01).toLocaleString("en-IN")}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 6px" }}>Q2 (Jul-Sep)</td>
                    <td style={{ padding: "8px 6px" }}>194-S</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.25).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.25 * 0.01).toLocaleString("en-IN")}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px 6px" }}>Q3 (Oct-Dec)</td>
                    <td style={{ padding: "8px 6px" }}>194-S</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.25).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.25 * 0.01).toLocaleString("en-IN")}</td>
                  </tr>
                  <tr style={{ borderBottom: "2px solid #000" }}>
                    <td style={{ padding: "8px 6px" }}>Q4 (Jan-Mar)</td>
                    <td style={{ padding: "8px 6px" }}>194-S</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.25).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.25 * 0.01).toLocaleString("en-IN")}</td>
                  </tr>
                  <tr style={{ fontWeight: "bold" }}>
                    <td colSpan="2" style={{ padding: "8px 6px" }}>TOTAL</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn).toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right", padding: "8px 6px" }}>₹{Math.floor(totalWithdrawn * 0.01).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: "0.75rem", marginTop: "2rem" }}>
                <div>
                  Date Generated: {new Date().toLocaleDateString("en-IN")}<br />
                  Place: Bengaluru, India
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: "0.85rem", fontStyle: "italic", borderBottom: "1px solid #000", width: "120px", margin: "0 auto 4px" }}>
                    GetMeAChai Tax Dept
                  </div>
                  Authorized Signatory
                </div>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={() => setIsTaxModalOpen(false)}>
                Close
              </button>
              <button 
                className="btn-brand" 
                onClick={() => {
                  const printContents = document.getElementById("tax-document-print").innerHTML;
                  const originalContents = document.body.innerHTML;
                  document.body.innerHTML = printContents;
                  window.print();
                  document.body.innerHTML = originalContents;
                  window.location.reload();
                }}
              >
                🖨️ Print Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PAYOUT SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "450px" }}>
            <div className="modal-header">
              <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#fff" }}>Edit Payout Schedule</h2>
              <button className="close-btn" onClick={() => setIsScheduleModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSaveScheduleModal}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Next Automatic Payout Date
                  </label>
                  <input
                    type="text"
                    className="select-input"
                    value={scheduleNextDate}
                    onChange={(e) => setScheduleNextDate(e.target.value)}
                    placeholder="e.g. Friday, Oct 25"
                    required
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Processing Duration
                  </label>
                  <input
                    type="text"
                    className="select-input"
                    value={scheduleProcessingTime}
                    onChange={(e) => setScheduleProcessingTime(e.target.value)}
                    placeholder="e.g. 1-2 business days"
                    required
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                    Minimum Threshold (₹)
                  </label>
                  <input
                    type="number"
                    className="select-input"
                    value={scheduleThreshold}
                    onChange={(e) => setScheduleThreshold(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
              <div className="modal-footer" style={{ marginTop: "1.5rem", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button type="button" className="btn-outline" onClick={() => setIsScheduleModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-brand" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Schedule"}
                </button>
              </div>
            </form>
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
