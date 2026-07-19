"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Search,
  LogOut,
  Compass,
  User,
  Settings,
  ArrowLeft,
  Building2,
  Wallet,
  Coins,
  Send,
  CreditCard,
  Globe,
  MapPin
} from "lucide-react";
import "../../dashboard.css";

export default function AddPayoutMethod() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  const [loading, setLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userData, setUserData] = useState(null);

  // Tab State
  const [activeTab, setActiveTab] = useState("national"); // "national" or "international"
  const [methodType, setMethodType] = useState("bank"); // "bank", "upi", "paypal", "stripe", "crypto", "wise", "payoneer", "wire"

  // Form Fields
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: ""
  });
  const [upiDetails, setUpiDetails] = useState({
    upiId: ""
  });
  const [paypalDetails, setPaypalDetails] = useState({
    email: ""
  });
  const [stripeDetails, setStripeDetails] = useState({
    accountId: ""
  });
  const [wiseDetails, setWiseDetails] = useState({
    email: "",
    memberId: ""
  });
  const [payoneerDetails, setPayoneerDetails] = useState({
    email: "",
    payeeId: ""
  });
  const [wireDetails, setWireDetails] = useState({
    beneficiaryName: "",
    bankName: "",
    swiftCode: "",
    iban: "",
    bankCountry: ""
  });
  const [cryptoDetails, setCryptoDetails] = useState({
    walletAddress: ""
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch basic user profile data
  useEffect(() => {
    if (status !== "authenticated") return;
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/dashboard/payouts");
        if (response.ok) {
          const resData = await response.json();
          setUserData(resData);
        }
      } catch (error) {
        console.error("Error fetching payouts stats:", error);
      }
    };
    fetchProfile();
  }, [status]);

  // Auto-switch method type when main tab changes
  useEffect(() => {
    if (activeTab === "national") {
      setMethodType("bank");
    } else {
      setMethodType("paypal");
    }
    setErrorMsg("");
  }, [activeTab]);

  const validateForm = () => {
    if (methodType === "bank") {
      const { accountHolderName, bankName, accountNumber, ifscCode } = bankDetails;
      if (!accountHolderName.trim() || !bankName.trim() || !accountNumber.trim() || !ifscCode.trim()) {
        return "All bank details are required.";
      }
      if (accountNumber.length < 9) {
        return "Please enter a valid account number.";
      }
      if (ifscCode.length !== 11) {
        return "IFSC code must be exactly 11 characters.";
      }
    } else if (methodType === "upi") {
      const { upiId } = upiDetails;
      if (!upiId.trim()) return "UPI ID is required.";
      if (!upiId.includes("@")) return "Please enter a valid UPI ID (e.g. name@upi).";
    } else if (methodType === "paypal") {
      const { email } = paypalDetails;
      if (!email.trim()) return "PayPal email is required.";
      if (!email.includes("@")) return "Please enter a valid email address.";
    } else if (methodType === "stripe") {
      const { accountId } = stripeDetails;
      if (!accountId.trim()) return "Stripe Account ID is required.";
      if (!accountId.startsWith("acct_")) return "Stripe Account ID should start with 'acct_'.";
    } else if (methodType === "wise") {
      const { email, memberId } = wiseDetails;
      if (!email.trim() && !memberId.trim()) return "Either Wise email or Member ID is required.";
      if (email && !email.includes("@")) return "Please enter a valid Wise email address.";
    } else if (methodType === "payoneer") {
      const { email, payeeId } = payoneerDetails;
      if (!email.trim() && !payeeId.trim()) return "Either Payoneer email or Payee ID is required.";
      if (email && !email.includes("@")) return "Please enter a valid Payoneer email address.";
    } else if (methodType === "wire") {
      const { beneficiaryName, bankName, swiftCode, iban, bankCountry } = wireDetails;
      if (!beneficiaryName.trim() || !bankName.trim() || !swiftCode.trim() || !iban.trim() || !bankCountry.trim()) {
        return "All international wire transfer fields are required.";
      }
      if (swiftCode.length < 8 || swiftCode.length > 11) {
        return "SWIFT/BIC code must be 8 or 11 characters.";
      }
    } else if (methodType === "crypto") {
      const { walletAddress } = cryptoDetails;
      if (!walletAddress.trim()) return "Crypto wallet address is required.";
      if (walletAddress.length < 30 || !walletAddress.startsWith("0x")) {
        return "Please enter a valid Polygon (0x) USDC wallet address.";
      }
    }
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);

    let details = {};
    if (methodType === "bank") details = bankDetails;
    if (methodType === "upi") details = upiDetails;
    if (methodType === "paypal") details = paypalDetails;
    if (methodType === "stripe") details = stripeDetails;
    if (methodType === "wise") details = wiseDetails;
    if (methodType === "payoneer") details = payoneerDetails;
    if (methodType === "wire") details = wireDetails;
    if (methodType === "crypto") details = cryptoDetails;

    try {
      const response = await fetch("/api/dashboard/payouts/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          methodType,
          details
        })
      });

      if (response.ok) {
        setSuccessMsg("Payout method added successfully! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard/payouts");
        }, 1500);
      } else {
        const data = await response.json();
        setErrorMsg(data.error || "Failed to add payout method.");
      }
    } catch (error) {
      console.error("Error saving payout method:", error);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && !userData)) {
    return (
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Loading config...</p>
        </div>
      </div>
    );
  }

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
          <Link href="/dashboard/wallet" className="nav-item">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              My Wallet
            </span>
          </Link>
          <Link href="/dashboard/audience-insights" className="nav-item">
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Audience Insights
            </span>
          </Link>
        </div>
        <div className="nav-group">
          <div className="nav-label">Platform Views</div>
          <Link href="/dashboard/platform?view=search" className="nav-item">
            <span className="flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Search Creators
            </span>
          </Link>
          <Link href="/dashboard/platform?view=profile" className="nav-item">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Public Profile
            </span>
          </Link>
          <Link href="/dashboard/platform?view=settings" className="nav-item">
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
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
                {userData.avatarUrl && userData.avatarUrl !== "https://i.pravatar.cc/100?img=11" ? (
                  <img src={userData.avatarUrl} className="avatar" alt="Profile" />
                ) : (
                  <div className="avatar-letter">
                    {(userData.username || userData.email || "U").charAt(0).toUpperCase()}
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
                      <span className="dropdown-username">{userData.username}</span>
                      <span className="dropdown-email">{userData.email}</span>
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

        <main className="content" style={{ maxWidth: "800px" }}>
          {/* Back button */}
          <Link
            href="/dashboard/payouts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
              transition: "color 0.2s"
            }}
            className="hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Payouts
          </Link>

          <div className="page-title" style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: "600", letterSpacing: "-0.03em", marginBottom: "6px" }}>
              Add Payout Method
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Connect a new channel to withdraw your creator earnings.
            </p>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: "2rem", border: "1px solid var(--border-strong)", background: "rgba(10, 10, 10, 0.6)", backdropFilter: "blur(12px)" }}>
            {/* Category selection tabs */}
            <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.2rem", marginBottom: "1.5rem" }}>
              <button
                type="button"
                onClick={() => setActiveTab("national")}
                style={{
                  background: activeTab === "national" ? "var(--border-strong)" : "transparent",
                  border: "1px solid " + (activeTab === "national" ? "var(--border-strong)" : "transparent"),
                  color: activeTab === "national" ? "var(--text-main)" : "var(--text-muted)",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  transition: "var(--transition)"
                }}
              >
                🇮🇳 National / Domestic
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("international")}
                style={{
                  background: activeTab === "international" ? "var(--border-strong)" : "transparent",
                  border: "1px solid " + (activeTab === "international" ? "var(--border-strong)" : "transparent"),
                  color: activeTab === "international" ? "var(--text-main)" : "var(--text-muted)",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  transition: "var(--transition)"
                }}
              >
                🌐 International
              </button>
            </div>

            {/* Inner method type selection */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", flexWrap: "wrap" }}>
              {activeTab === "national" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMethodType("bank")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: methodType === "bank" ? "rgba(139, 92, 246, 0.15)" : "var(--bg-surface)",
                      border: "1px solid " + (methodType === "bank" ? "var(--brand)" : "var(--border-subtle)"),
                      color: methodType === "bank" ? "var(--text-main)" : "var(--text-muted)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "var(--transition)"
                    }}
                  >
                    <Building2 className="w-4 h-4" /> Bank Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethodType("upi")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: methodType === "upi" ? "rgba(139, 92, 246, 0.15)" : "var(--bg-surface)",
                      border: "1px solid " + (methodType === "upi" ? "var(--brand)" : "var(--border-subtle)"),
                      color: methodType === "upi" ? "var(--text-main)" : "var(--text-muted)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "var(--transition)"
                    }}
                  >
                    <Send className="w-4 h-4" /> UPI ID
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMethodType("paypal")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: methodType === "paypal" ? "rgba(139, 92, 246, 0.15)" : "var(--bg-surface)",
                      border: "1px solid " + (methodType === "paypal" ? "var(--brand)" : "var(--border-subtle)"),
                      color: methodType === "paypal" ? "var(--text-main)" : "var(--text-muted)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "var(--transition)"
                    }}
                  >
                    <Wallet className="w-4 h-4" style={{ color: "#003087" }} /> PayPal Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethodType("stripe")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: methodType === "stripe" ? "rgba(139, 92, 246, 0.15)" : "var(--bg-surface)",
                      border: "1px solid " + (methodType === "stripe" ? "var(--brand)" : "var(--border-subtle)"),
                      color: methodType === "stripe" ? "var(--text-main)" : "var(--text-muted)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "var(--transition)"
                    }}
                  >
                    <CreditCard className="w-4 h-4" style={{ color: "#635bff" }} /> Stripe Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethodType("wise")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: methodType === "wise" ? "rgba(139, 92, 246, 0.15)" : "var(--bg-surface)",
                      border: "1px solid " + (methodType === "wise" ? "var(--brand)" : "var(--border-subtle)"),
                      color: methodType === "wise" ? "var(--text-main)" : "var(--text-muted)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "var(--transition)"
                    }}
                  >
                    <Globe className="w-4 h-4" style={{ color: "#00b9ff" }} /> Wise Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethodType("payoneer")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: methodType === "payoneer" ? "rgba(139, 92, 246, 0.15)" : "var(--bg-surface)",
                      border: "1px solid " + (methodType === "payoneer" ? "var(--brand)" : "var(--border-subtle)"),
                      color: methodType === "payoneer" ? "var(--text-main)" : "var(--text-muted)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "var(--transition)"
                    }}
                  >
                    <CreditCard className="w-4 h-4" style={{ color: "#ff4f00" }} /> Payoneer
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethodType("wire")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: methodType === "wire" ? "rgba(139, 92, 246, 0.15)" : "var(--bg-surface)",
                      border: "1px solid " + (methodType === "wire" ? "var(--brand)" : "var(--border-subtle)"),
                      color: methodType === "wire" ? "var(--text-main)" : "var(--text-muted)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "var(--transition)"
                    }}
                  >
                    <Building2 className="w-4 h-4" style={{ color: "#a1a1aa" }} /> Wire Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethodType("crypto")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: methodType === "crypto" ? "rgba(139, 92, 246, 0.15)" : "var(--bg-surface)",
                      border: "1px solid " + (methodType === "crypto" ? "var(--brand)" : "var(--border-subtle)"),
                      color: methodType === "crypto" ? "var(--text-main)" : "var(--text-muted)",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "500",
                      transition: "var(--transition)"
                    }}
                  >
                    <Coins className="w-4 h-4" style={{ color: "#ec4899" }} /> Crypto Wallet
                  </button>
                </>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSave}>
              {errorMsg && (
                <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", color: "#f87171", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", color: "#34d399", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  ✓ {successMsg}
                </div>
              )}

              {methodType === "bank" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Account Holder Name</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. John Doe"
                      value={bankDetails.accountHolderName}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Bank Name</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. HDFC Bank"
                      value={bankDetails.bankName}
                      onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Account Number</label>
                    <input
                      type="password"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. 50100234567890"
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>IFSC Code</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", textTransform: "uppercase" }}
                      placeholder="e.g. HDFC0000123"
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
              )}

              {methodType === "upi" && (
                <div className="form-group">
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>UPI ID</label>
                  <input
                    type="text"
                    className="text-input"
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                    placeholder="e.g. username@okhdfcbank"
                    value={upiDetails.upiId}
                    onChange={(e) => setUpiDetails({ ...upiDetails, upiId: e.target.value })}
                  />
                </div>
              )}

              {methodType === "paypal" && (
                <div className="form-group">
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>PayPal Email Address</label>
                  <input
                    type="email"
                    className="text-input"
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                    placeholder="e.g. email@paypal.com"
                    value={paypalDetails.email}
                    onChange={(e) => setPaypalDetails({ ...paypalDetails, email: e.target.value })}
                  />
                </div>
              )}

              {methodType === "stripe" && (
                <div className="form-group">
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Stripe Account ID</label>
                  <input
                    type="text"
                    className="text-input"
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                    placeholder="e.g. acct_1Nxxxxxxxxxxxx"
                    value={stripeDetails.accountId}
                    onChange={(e) => setStripeDetails({ ...stripeDetails, accountId: e.target.value })}
                  />
                </div>
              )}

              {methodType === "wise" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Wise Email Address</label>
                    <input
                      type="email"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. user@wise.com"
                      value={wiseDetails.email}
                      onChange={(e) => setWiseDetails({ ...wiseDetails, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Wise Member ID (Optional)</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. 12345678"
                      value={wiseDetails.memberId}
                      onChange={(e) => setWiseDetails({ ...wiseDetails, memberId: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {methodType === "payoneer" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Payoneer Email Address</label>
                    <input
                      type="email"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. user@payoneer.com"
                      value={payoneerDetails.email}
                      onChange={(e) => setPayoneerDetails({ ...payoneerDetails, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Payoneer Payee ID (Optional)</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. payee_987654"
                      value={payoneerDetails.payeeId}
                      onChange={(e) => setPayoneerDetails({ ...payoneerDetails, payeeId: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {methodType === "wire" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Beneficiary / Account Name</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. John Doe International Corp"
                      value={wireDetails.beneficiaryName}
                      onChange={(e) => setWireDetails({ ...wireDetails, beneficiaryName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Bank Name</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. Barclays Bank PLC"
                      value={wireDetails.bankName}
                      onChange={(e) => setWireDetails({ ...wireDetails, bankName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>SWIFT / BIC Code</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)", textTransform: "uppercase" }}
                      placeholder="e.g. BARCGB22"
                      value={wireDetails.swiftCode}
                      onChange={(e) => setWireDetails({ ...wireDetails, swiftCode: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>IBAN / Account Number</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. GB29BARC20201555555555"
                      value={wireDetails.iban}
                      onChange={(e) => setWireDetails({ ...wireDetails, iban: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Bank Country</label>
                    <input
                      type="text"
                      className="text-input"
                      style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                      placeholder="e.g. United Kingdom"
                      value={wireDetails.bankCountry}
                      onChange={(e) => setWireDetails({ ...wireDetails, bankCountry: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {methodType === "crypto" && (
                <div className="form-group">
                  <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Polygon USDC Wallet Address</label>
                  <input
                    type="text"
                    className="text-input"
                    style={{ width: "100%", padding: "12px", border: "1px solid var(--border-strong)", background: "var(--bg-elevated)", color: "var(--text-main)", borderRadius: "var(--radius-sm)" }}
                    placeholder="e.g. 0x71C...B29"
                    value={cryptoDetails.walletAddress}
                    onChange={(e) => setCryptoDetails({ ...cryptoDetails, walletAddress: e.target.value })}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "2rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.5rem" }}>
                <Link
                  href="/dashboard/payouts"
                  className="btn-outline"
                  style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn-brand"
                  disabled={loading}
                  style={{ minWidth: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {loading ? <div className="loader" style={{ display: "block" }}></div> : "Save Method"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
