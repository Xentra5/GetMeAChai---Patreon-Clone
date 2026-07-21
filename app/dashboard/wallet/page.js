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
  LogOut,
  Compass,
  User,
  Settings,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Building,
  Plus,
  Send,
  HelpCircle,
  CheckCircle,
  Building2,
  Lock,
  Globe,
  MapPin,
  MessageSquare
} from "lucide-react";
import "../dashboard.css";

export default function WalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // States
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [savedMethods, setSavedMethods] = useState([]);
  
  // Region & Localisation State: "USA" (USD) or "IND" (INR)
  const [userRegion, setUserRegion] = useState("USA"); 

  // Modals & Flows
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("card"); // "card" | "upi" | "netbanking" | "paypal" | "applepay" | "ach" | "saved"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Card Input States
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [isInternationalCard, setIsInternationalCard] = useState(false);

  // UPI Input States
  const [upiId, setUpiId] = useState("");

  // Netbanking States
  const [selectedNetbank, setSelectedNetbank] = useState("hdfc");
  const [netbankUserId, setNetbankUserId] = useState("");
  const [netbankPassword, setNetbankPassword] = useState("");
  const [netbankStep, setNetbankStep] = useState(1); // 1: select & credentials, 2: OTP verification

  // PayPal Input States
  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalPassword, setPaypalPassword] = useState("");

  // ACH Input States
  const [achBankName, setAchBankName] = useState("");
  const [achRouting, setAchRouting] = useState("");
  const [achAccount, setAchAccount] = useState("");

  // Saved Account State
  const [selectedSavedMethodId, setSelectedSavedMethodId] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");

  // Animated states
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  // Constants
  const usdToInrRate = 83.5; // conversion rate: 1 USD = 83.5 INR

  // Checkout Currency matches the region
  const checkoutCurrency = userRegion === "USA" ? "USD" : "INR";

  // Calculate dynamic transaction fees based on Region and Payment Method
  const amountNum = Number(depositAmount) || 0;
  let transactionFee = 0;
  let feeLabel = "Processing Fee";

  if (userRegion === "USA") {
    // USD Fees
    if (depositMethod === "card") {
      if (isInternationalCard) {
        transactionFee = amountNum * 0.039 + 0.30;
        feeLabel = "Intl Card Fee (3.9% + $0.30)";
      } else {
        transactionFee = amountNum * 0.029 + 0.30;
        feeLabel = "Stripe Card Fee (2.9% + $0.30)";
      }
    } else if (depositMethod === "paypal") {
      transactionFee = amountNum * 0.034 + 0.49;
      feeLabel = "PayPal Merchant Fee (3.4% + $0.49)";
    } else if (depositMethod === "applepay") {
      transactionFee = amountNum * 0.029 + 0.30;
      feeLabel = "Apple Pay Gateway Fee (2.9% + $0.30)";
    } else if (depositMethod === "ach") {
      transactionFee = Math.min(amountNum * 0.01, 5.00);
      feeLabel = "Bank ACH Fee (1.0% - Max $5.00)";
    } else if (depositMethod === "saved") {
      transactionFee = amountNum * 0.015;
      feeLabel = "Saved Method Fee (1.5%)";
    }
  } else {
    // INR Fees
    if (depositMethod === "card") {
      if (isInternationalCard) {
        transactionFee = amountNum * 0.035;
        feeLabel = "Intl Card Fee (3.5%)";
      } else {
        transactionFee = amountNum * 0.02;
        feeLabel = "Card Processing Fee (2.0%)";
      }
    } else if (depositMethod === "upi") {
      transactionFee = 0;
      feeLabel = "UPI Transfer Fee (0%)";
    } else if (depositMethod === "netbanking") {
      transactionFee = amountNum * 0.015;
      feeLabel = "Net Banking Fee (1.5%)";
    } else if (depositMethod === "saved") {
      transactionFee = amountNum * 0.01;
      feeLabel = "Saved Account Fee (1.0%)";
    }
  }

  // Round values
  transactionFee = Math.round(transactionFee * 100) / 100;
  const totalAmountToPay = Math.round((amountNum + transactionFee) * 100) / 100;

  // Credit amount in INR to save to user's balance
  const creditAmountINR = checkoutCurrency === "USD" ? amountNum * usdToInrRate : amountNum;

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch Wallet details & Payout/Withdrawal Methods
  const fetchWalletData = async () => {
    try {
      const response = await fetch("/api/dashboard/wallet");
      if (response.ok) {
        const resData = await response.json();
        setData(resData);
      }

      // Fetch saved accounts
      const methodsRes = await fetch("/api/dashboard/payouts/methods");
      if (methodsRes.ok) {
        const methodsData = await methodsRes.json();
        const availableMethods = methodsData.methods || [];
        setSavedMethods(availableMethods);
        if (availableMethods.length > 0) {
          setSelectedSavedMethodId(availableMethods[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching wallet details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load region from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRegion = localStorage.getItem("userRegion");
      if (savedRegion) {
        setUserRegion(savedRegion);
      }
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchWalletData();
  }, [status]);

  // Auto-submit Netbanking OTP verification step
  useEffect(() => {
    if (depositMethod === "netbanking" && netbankStep === 2) {
      const timer = setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        handleDepositSubmit(fakeEvent);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [netbankStep, depositMethod]);

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

  // Trigger animations when data changes
  useEffect(() => {
    if (!data) return;

    const deposits = data.history.filter(tx => tx.type === "credit" && tx.status === "success");
    const spent = data.history.filter(tx => tx.type === "debit" && tx.status === "success");

    let rawDepositsSum = deposits.reduce((sum, tx) => sum + tx.amount, 0);
    let rawSpentSum = spent.reduce((sum, tx) => sum + tx.amount, 0);
    let rawBalance = data.walletBalance;

    // Convert values to local currency display
    if (userRegion === "USA") {
      rawBalance = rawBalance / usdToInrRate;
      rawDepositsSum = rawDepositsSum / usdToInrRate;
      rawSpentSum = rawSpentSum / usdToInrRate;
    }

    setWalletBalance(0);
    setTotalDeposited(0);
    setTotalSpent(0);

    animateValue(setWalletBalance, 0, rawBalance, 1200);
    animateValue(setTotalDeposited, 0, rawDepositsSum, 1200);
    animateValue(setTotalSpent, 0, rawSpentSum, 1200);
  }, [data, userRegion]);

  // Styled card network SVG logos renderer
  const renderCardLogo = (brand) => {
    if (!brand) return null;
    if (brand === "Visa") {
      return (
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "inline-flex", alignItems: "center" }}>
          <svg viewBox="0 0 24 15" width="36" height="22" style={{ borderRadius: "3px" }}>
            <rect width="24" height="15" fill="#1A1F71" rx="2"/>
            <path d="M4.5 11.5L6.2 4.5h1.9l-1.7 7h-1.9zm5.9-6.8c-.4-.2-1-.3-1.6-.3-1.8 0-3 1-3.1 2.3-.1 1 1 1.6 1.7 1.9.7.3.9.6.9.9-.1.5-.6.7-1.2.7-.8 0-1.2-.1-1.9-.4l-.3 1.2c.3.1.9.3 1.6.3 1.9 0 3.1-1 3.1-2.4.1-1.1-.7-1.7-1.9-2.2-.6-.3-.9-.5-.9-.8 0-.4.4-.7 1.1-.7.6 0 1.1.1 1.5.3l.3-1.2zm4.1 6.8l.9-4.8h1.7l-1 4.8h-1.6zm4.8-4.8c-.3-.2-.8-.4-1.4-.4-1.5 0-2.6.9-2.6 2.3-.1 1.2.8 1.8 1.6 2.2.8.4 1 .6 1 .9-.1.5-.7.8-1.4.8-.8 0-1.3-.2-1.7-.4l-.4 1.2c.4.2 1.1.3 1.8.3 1.9 0 3.2-.9 3.2-2.4 0-1.1-.7-1.8-1.9-2.3-.7-.3-.9-.6-.9-.9 0-.4.5-.7 1.2-.7.6 0 1.1.1 1.5.3l.3-1.2z" fill="#FFF"/>
          </svg>
        </span>
      );
    }
    if (brand === "Mastercard") {
      return (
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "inline-flex", alignItems: "center" }}>
          <svg viewBox="0 0 24 15" width="36" height="22" style={{ borderRadius: "3px" }}>
            <rect width="24" height="15" fill="#111" rx="2"/>
            <circle cx="9" cy="7.5" r="4.5" fill="#EB001B" opacity="0.95"/>
            <circle cx="15" cy="7.5" r="4.5" fill="#F79E1B" opacity="0.95"/>
            <path d="M12 7.5a4.5 4.5 0 0 1 .8-2.6 4.5 4.5 0 0 1 0 5.2 4.5 4.5 0 0 1-.8-2.6z" fill="#FF5F00"/>
          </svg>
        </span>
      );
    }
    if (brand === "Amex") {
      return (
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "inline-flex", alignItems: "center" }}>
          <svg viewBox="0 0 24 15" width="36" height="22" style={{ borderRadius: "3px" }}>
            <rect width="24" height="15" fill="#016fd0" rx="2"/>
            <text x="2.5" y="10" fill="#FFF" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">AMEX</text>
          </svg>
        </span>
      );
    }
    if (brand === "RuPay") {
      return (
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", display: "inline-flex", alignItems: "center" }}>
          <svg viewBox="0 0 24 15" width="36" height="22" style={{ borderRadius: "3px" }}>
            <rect width="24" height="15" fill="#f8fafc" rx="2" stroke="#e2e8f0" strokeWidth="0.5"/>
            <text x="2" y="8" fill="#0c4a6e" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">RuPay</text>
            <path d="M2 10.5h16l2-2.5H4L2 10.5z" fill="#f97316"/>
          </svg>
        </span>
      );
    }
    return null;
  };

  // Card brand detection logic
  const getCardBrand = (number) => {
    const trimmed = number.replace(/\s+/g, "");
    if (/^4/.test(trimmed)) return "Visa";
    if (/^5[1-5]/.test(trimmed) || /^2(22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[0-1][0-9]|720)/.test(trimmed)) return "Mastercard";
    if (/^3[47]/.test(trimmed)) return "Amex";
    if (/^(60|65|81|82)/.test(trimmed)) return "RuPay";
    return "";
  };

  // Card Bank detection logic based on BIN prefix
  const getCardBank = (number) => {
    const trimmed = number.replace(/\s+/g, "");
    if (trimmed.length < 6) return "";
    
    if (/^411111/.test(trimmed)) return "HDFC Bank";
    if (/^422222/.test(trimmed)) return "ICICI Bank";
    if (/^4000/.test(trimmed)) return "Kotak Mahindra Bank";
    if (/^4333/.test(trimmed)) return "State Bank of India";
    if (/^4556/.test(trimmed)) return "Axis Bank";
    if (/^37/.test(trimmed)) return "American Express Bank";
    if (/^5[1-5]/.test(trimmed)) return "Citibank";
    if (/^6[05]/.test(trimmed)) return "Bank of Baroda";
    return "Generic Bank Card";
  };

  // Card input formatter (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    setCardNumber(formatted);
  };

  // Expiry input formatter (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Submit simulated deposit
  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }

    if (depositMethod === "card") {
      const cleanCard = cardNumber.replace(/\s+/g, "");
      if (cleanCard.length < 15) {
        alert("Please enter a valid Card Number.");
        return;
      }
      if (cardExpiry.length < 5) {
        alert("Please enter a valid expiration date (MM/YY).");
        return;
      }
      if (cardCvv.length < 3) {
        alert("Please enter a valid CVV.");
        return;
      }
    } else if (depositMethod === "upi") {
      if (!upiId.includes("@")) {
        alert("Please enter a valid UPI ID (e.g. user@okhdfc).");
        return;
      }
    } else if (depositMethod === "netbanking") {
      if (netbankStep === 1) {
        if (!netbankUserId.trim() || !netbankPassword.trim()) {
          alert("Please enter your mock User ID and Password.");
          return;
        }
        setNetbankStep(2);
        return;
      }
    } else if (depositMethod === "paypal") {
      if (!paypalEmail.includes("@") || !paypalPassword.trim()) {
        alert("Please enter your PayPal account credentials.");
        return;
      }
    } else if (depositMethod === "ach") {
      if (achRouting.length < 9 || !achAccount.trim() || !achBankName.trim()) {
        alert("Please enter a valid 9-digit ACH routing number, bank name, and account number.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      let methodLabel = "";
      if (depositMethod === "card") {
        const detectedBrand = getCardBrand(cardNumber);
        const detectedBank = getCardBank(cardNumber);
        const bankName = detectedBank ? `${detectedBank} ` : "";
        methodLabel = `${bankName}${detectedBrand} Card (**** ${cardNumber.slice(-4)})`;
      } else if (depositMethod === "upi") {
        methodLabel = `UPI (${upiId})`;
      } else if (depositMethod === "netbanking") {
        methodLabel = `Net Banking (${selectedNetbank.toUpperCase()})`;
      } else if (depositMethod === "paypal") {
        methodLabel = `PayPal Checkout (${paypalEmail})`;
      } else if (depositMethod === "applepay") {
        methodLabel = "Apple Pay Express";
      } else if (depositMethod === "ach") {
        methodLabel = `ACH Transfer (${achBankName} - ****${achAccount.slice(-4)})`;
      } else if (depositMethod === "saved") {
        const matched = savedMethods.find(m => m._id === selectedSavedMethodId);
        if (matched) {
          if (matched.methodType === "bank") {
            methodLabel = `Saved Bank (${matched.details.bankName} - ****${matched.details.accountNumber.slice(-4)})`;
          } else if (matched.methodType === "upi") {
            methodLabel = `Saved UPI (${matched.details.upiId})`;
          } else {
            methodLabel = `Saved Account (${matched.methodType.toUpperCase()})`;
          }
        } else {
          methodLabel = "Saved Account";
        }
      }

      const res = await fetch("/api/dashboard/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: creditAmountINR,
          paymentMethod: methodLabel,
        }),
      });

      if (res.ok) {
        setIsDepositModalOpen(false);
        setDepositAmount("");
        setCardNumber("");
        setCardExpiry("");
        setCardCvv("");
        setCardHolder("");
        setUpiId("");
        setNetbankUserId("");
        setNetbankPassword("");
        setNetbankStep(1);
        setPaypalEmail("");
        setPaypalPassword("");
        setAchBankName("");
        setAchRouting("");
        setAchAccount("");
        setIsInternationalCard(false);
        const msg = checkoutCurrency === "USD"
          ? `Successfully added $${amount.toLocaleString("en-US")} USD (credited as ₹${creditAmountINR.toLocaleString("en-IN")} INR to wallet)`
          : `Successfully added ₹${amount.toLocaleString("en-IN")} to your wallet! (Inclusive of ₹${transactionFee} Transaction Charge)`;
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
        await fetchWalletData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Deposit failed.");
      }
    } catch (error) {
      console.error(error);
      alert("Error processing deposit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter transaction history
  const filteredHistory = data?.history.filter((tx) => {
    if (statusFilter !== "All Statuses") {
      if (statusFilter === "Completed" && tx.status !== "success" && tx.status !== "completed") return false;
      if (statusFilter === "Pending" && tx.status !== "pending") return false;
      if (statusFilter === "Failed" && tx.status !== "failed") return false;
    }

    if (typeFilter !== "All Types") {
      if (typeFilter === "Deposits" && tx.type !== "credit") return false;
      if (typeFilter === "Payments" && tx.type !== "debit") return false;
    }

    return true;
  }) || [];

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="dashboard-body flex items-center justify-center min-h-screen" style={{ background: "#000" }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Synchronizing secure wallet system...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const cardBrand = getCardBrand(cardNumber);
  const cardBank = getCardBank(cardNumber);

  // Quick Net Banking option definitions
  const netBanks = [
    { id: "hdfc", name: "HDFC Bank", short: "HDFC" },
    { id: "icici", name: "ICICI Bank", short: "ICICI" },
    { id: "sbi", name: "State Bank of India", short: "SBI" },
    { id: "axis", name: "Axis Bank", short: "AXIS" },
    { id: "kotak", name: "Kotak Bank", short: "KOTAK" }
  ];

  // Dynamic payment methods list based on currency
  const paymentMethodsList = checkoutCurrency === "USD" ? [
    { id: "card", label: "Credit / Debit Card", icon: <CreditCard className="w-4 h-4" /> },
    { id: "paypal", label: "PayPal Express", icon: <Wallet className="w-4 h-4" /> },
    { id: "applepay", label: "Apple / Google Pay", icon: <CheckCircle className="w-4 h-4" /> },
    { id: "ach", label: "ACH Bank Transfer", icon: <Building2 className="w-4 h-4" /> }
  ] : [
    { id: "card", label: "Credit / Debit Card", icon: <CreditCard className="w-4 h-4" /> },
    { id: "upi", label: "UPI (Google Pay, PhonePe)", icon: <Send className="w-4 h-4" /> },
    { id: "netbanking", label: "Net Banking", icon: <Building className="w-4 h-4" /> }
  ];

  // Dynamic Presets based on Region
  const presetsList = userRegion === "USA" ? [
    { amount: 5, tag: "Starter", desc: "4 Chais equivalent" },
    { amount: 10, tag: "Popular", desc: "8 Chais equivalent" },
    { amount: 25, tag: "Best Value", desc: "20 Chais equivalent" },
    { amount: 50, tag: "Pro", desc: "40 Chais equivalent" },
    { amount: 100, tag: "Ultimate", desc: "80 Chais equivalent" }
  ] : [
    { amount: 100, tag: "Starter", desc: "1 Chai" },
    { amount: 250, tag: "Popular", desc: "2.5 Chais" },
    { amount: 500, tag: "Best Value", desc: "5 Chais" },
    { amount: 1000, tag: "Pro", desc: "10 Chais" },
    { amount: 2000, tag: "Ultimate", desc: "20 Chais" }
  ];

  return (
    <div className="dashboard-body wallet-theme">
      {/* Dynamic Style block to differentiate colors on the wallet page */}
      <style dangerouslySetInnerHTML={{__html: `
        .wallet-theme {
          --brand: #06b6d4 !important; /* Premium Cyan */
          --brand-glow: rgba(6, 182, 212, 0.25) !important;
        }
        .wallet-theme .nav-item.active {
          box-shadow: inset 1px 0 0 0 var(--brand) !important;
          background: rgba(6, 182, 212, 0.08) !important;
        }
        .wallet-theme .c-primary {
          border: 1px solid rgba(6, 182, 212, 0.3) !important;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(0, 0, 0, 0) 100%) !important;
        }
        .card-brand-badge {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--brand);
          background: rgba(6, 182, 212, 0.15);
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.05em;
          border: 1px solid rgba(6, 182, 212, 0.3);
        }
        .card-bank-indicator {
          font-size: 0.8rem;
          color: #10b981;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 6px;
        }
        .bank-grid-btn {
          background: var(--bg-base);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          padding: 10px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bank-grid-btn.active {
          border-color: var(--brand);
          background: rgba(6, 182, 212, 0.06);
          color: var(--brand);
        }
        .preset-btn {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid var(--border-subtle);
          color: var(--text-main);
          padding: 24px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          position: relative;
          overflow: hidden;
        }
        .preset-btn:hover {
          border-color: var(--brand);
          background: rgba(6, 182, 212, 0.04);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(6, 182, 212, 0.12);
        }
        .preset-tag {
          position: absolute;
          top: 0;
          right: 0;
          background: rgba(6, 182, 212, 0.12);
          color: var(--brand);
          font-size: 0.6rem;
          font-weight: 700;
          padding: 3px 8px;
          border-bottom-left-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-left: 1px solid rgba(6, 182, 212, 0.2);
          border-bottom: 1px solid rgba(6, 182, 212, 0.2);
        }
        .preset-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .preset-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .wallet-theme .status {
          padding: 4px 8px !important;
          border-radius: 6px !important;
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          display: inline-flex !important;
        }
        .wallet-theme .s-completed {
          background: rgba(16, 185, 129, 0.08) !important;
          color: #10b981 !important;
          border: 1px solid rgba(16, 185, 129, 0.15) !important;
        }
        .wallet-theme .s-pending {
          background: rgba(245, 158, 11, 0.08) !important;
          color: #f59e0b !important;
          border: 1px solid rgba(245, 158, 11, 0.15) !important;
        }
        .wallet-theme .s-failed {
          background: rgba(239, 68, 68, 0.08) !important;
          color: #f87171 !important;
          border: 1px solid rgba(239, 68, 68, 0.15) !important;
        }
      `}} />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <span style={{ color: "var(--brand)" }}>▲</span> GetMeAChai
        </div>
        <div className="nav-group">
          <div className="nav-label">Analytics</div>
          <Link href="/dashboard" className="nav-item">
            <span className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </span>
          </Link>
          <Link href="/dashboard/payouts" className="nav-item">
            <span className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Revenue & Payouts
            </span>
          </Link>
          <Link href="/dashboard/wallet" className="nav-item active">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-cyan-400" />
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
          <Link href="/dashboard/platform?view=dms" className="nav-item">
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Direct Messages
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
                  setDepositMethod("card"); // Reset method type on region switch
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
                {data.avatarUrl ? (
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
              My Wallet
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
              Add funds to your wallet and support creators across the platform seamlessly.
            </p>
          </div>

          {/* BALANCE CARDS */}
          <div className="balance-grid">
            <div className="card c-primary">
              <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Wallet Balance ({checkoutCurrency})</span>
                <Wallet className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="card-value txt-success">
                {userRegion === "USA" ? "$" : "₹"}{walletBalance.toLocaleString(userRegion === "USA" ? "en-US" : "en-IN", { minimumFractionDigits: userRegion === "USA" ? 2 : 0, maximumFractionDigits: userRegion === "USA" ? 2 : 0 })}
              </div>
              <div className="card-desc">Funds ready to be used to support creators.</div>
              <button className="btn-brand" onClick={() => {
                setDepositMethod(savedMethods.length > 0 ? "saved" : "card");
                setIsDepositModalOpen(true);
              }} style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <Plus className="w-4 h-4" /> Add Funds
              </button>
            </div>

            <div className="card">
              <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Lifetime Deposited</span>
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="card-value">
                {userRegion === "USA" ? "$" : "₹"}{totalDeposited.toLocaleString(userRegion === "USA" ? "en-US" : "en-IN", { minimumFractionDigits: userRegion === "USA" ? 2 : 0, maximumFractionDigits: userRegion === "USA" ? 2 : 0 })}
              </div>
              <div className="card-desc">Total balance added since account creation.</div>
            </div>

            <div className="card">
              <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Total Spent</span>
                <ArrowUpRight className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="card-value">
                {userRegion === "USA" ? "$" : "₹"}{totalSpent.toLocaleString(userRegion === "USA" ? "en-US" : "en-IN", { minimumFractionDigits: userRegion === "USA" ? 2 : 0, maximumFractionDigits: userRegion === "USA" ? 2 : 0 })}
              </div>
              <div className="card-desc">Funds used to back and support creators.</div>
            </div>
          </div>

          {/* QUICK TOP-UP PRESET GRID */}
          <div className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "1rem" }}>Quick Top-Up Presets ({checkoutCurrency})</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px" }}>
              {presetsList.map((p) => (
                <button
                  key={p.amount}
                  type="button"
                  onClick={() => {
                    setDepositAmount(p.amount.toString());
                    setIsDepositModalOpen(true);
                  }}
                  className="preset-btn"
                >
                  {p.tag && <span className="preset-tag">{p.tag}</span>}
                  <span className="preset-sub" style={{ marginTop: p.tag ? "6px" : "0" }}>Deposit</span>
                  <span className="preset-value">{userRegion === "USA" ? "$" : "₹"}{p.amount}</span>
                  <span className="preset-sub" style={{ color: "var(--brand)", fontWeight: "600" }}>{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* WALLET TRANSACTIONS */}
          <div className="table-container" style={{ marginTop: "2rem" }}>
            <div className="table-header">
              <h2 style={{ fontSize: "1.1rem", fontWeight: "600" }}>Wallet History</h2>
              <div className="table-filters">
                <select className="select-input dropdown" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option>All Types</option>
                  <option>Deposits</option>
                  <option>Payments</option>
                </select>
                <select className="select-input dropdown" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Statuses</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Amount ({checkoutCurrency})</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((tx) => {
                    // Localise transaction amount dynamically
                    const localAmount = userRegion === "USA" ? tx.amount / usdToInrRate : tx.amount;
                    return (
                      <tr key={tx.id}>
                        <td>{tx.date}</td>
                        <td>
                          <div className="t-supporter">
                            <div
                              className="t-avatar"
                              style={{
                                background: tx.type === "debit" ? "#ef4444" : "#06b6d4",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                color: "#fff"
                              }}
                            >
                              {tx.type === "credit" ? "+" : "-"}
                            </div>
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
                              ? "Pending"
                              : "Failed"}
                          </span>
                        </td>
                        <td
                          style={{ textAlign: "right" }}
                          className={`t-amount ${tx.type === "credit" ? "txt-success" : "txt-muted"}`}
                        >
                          {tx.type === "credit" ? "+" : "-"}{userRegion === "USA" ? "$" : "₹"}{localAmount.toLocaleString(userRegion === "USA" ? "en-US" : "en-IN", { minimumFractionDigits: userRegion === "USA" ? 2 : 0, maximumFractionDigits: userRegion === "USA" ? 2 : 2 })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>
                      No wallet transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* DEPOSIT MODAL */}
      {isDepositModalOpen && (
        <div className="modal-overlay active" onClick={() => setIsDepositModalOpen(false)}>
          <div className="modal" onClick={(e) => {
            e.stopPropagation();
            setShowProfileDropdown(false);
          }} style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Add Funds to Wallet</h3>
              <button className="close-btn" onClick={() => setIsDepositModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleDepositSubmit}>
              <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto", paddingRight: "4px" }}>
                
                {/* Active Checkout Region Indicator */}
                <div style={{ padding: "8px 12px", background: "rgba(6, 182, 212, 0.05)", border: "1px solid rgba(6, 182, 212, 0.15)", borderRadius: "8px", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <span>Checkout Currency</span>
                  <span style={{ fontWeight: "700", color: "var(--brand)" }}>
                    {userRegion === "USA" ? "🇺🇸 USD ($)" : "🇮🇳 INR (₹)"}
                  </span>
                </div>

                {/* Amount input */}
                <div className="form-group">
                  <label>Amount to deposit</label>
                  <div className="input-wrapper">
                    <span className="input-prefix">{checkoutCurrency === "USD" ? "$" : "₹"}</span>
                    <input
                      type="number"
                      className="text-input"
                      placeholder="0.00"
                      min="1"
                      required
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Select Payment Method */}
                <div className="form-group">
                  <label>Select Payment Method</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                    
                    {/* Saved Accounts Option */}
                    {savedMethods.length > 0 && (
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 12px",
                          background: depositMethod === "saved" ? "rgba(6, 182, 212, 0.06)" : "var(--bg-base)",
                          border: depositMethod === "saved" ? "1px solid var(--brand)" : "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          transition: "var(--transition)"
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={depositMethod === "saved"}
                          onChange={() => setDepositMethod("saved")}
                          style={{ accentColor: "var(--brand)" }}
                        />
                        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}><CheckCircle className="w-4 h-4 text-emerald-400" /></span>
                        <span style={{ fontWeight: "600", fontSize: "0.85rem", color: "var(--text-main)" }}>Use Saved Payout Method</span>
                      </label>
                    )}

                    {paymentMethodsList.map((m) => (
                      <label
                        key={m.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 12px",
                          background: depositMethod === m.id ? "rgba(6, 182, 212, 0.06)" : "var(--bg-base)",
                          border: depositMethod === m.id ? "1px solid var(--brand)" : "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          transition: "var(--transition)"
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={depositMethod === m.id}
                          onChange={() => setDepositMethod(m.id)}
                          style={{ accentColor: "var(--brand)" }}
                        />
                        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>{m.icon}</span>
                        <span style={{ fontWeight: "500", fontSize: "0.85rem" }}>{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields: Saved Accounts */}
                {depositMethod === "saved" && savedMethods.length > 0 && (
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "8px", marginTop: "12px" }}>
                    <label style={{ fontSize: "0.75rem", marginBottom: "8px", display: "block" }}>Select Account</label>
                    <select
                      className="text-input"
                      value={selectedSavedMethodId}
                      onChange={(e) => setSelectedSavedMethodId(e.target.value)}
                      style={{ paddingLeft: "12px" }}
                    >
                      {savedMethods.map((m) => {
                        let label = "";
                        if (m.methodType === "bank") {
                          label = `Bank: ${m.details.bankName} (**** ${m.details.accountNumber.slice(-4)})`;
                        } else if (m.methodType === "upi") {
                          label = `UPI: ${m.details.upiId}`;
                        } else if (m.methodType === "paypal") {
                          label = `PayPal: ${m.details.email}`;
                        } else {
                          label = `${m.methodType.toUpperCase()}`;
                        }
                        return (
                          <option key={m._id} value={m._id}>
                            {label} {m.isDefault ? "(Default)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

                {/* Conditional Fields: Card Details */}
                {depositMethod === "card" && (
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "8px", marginTop: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h4 style={{ fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", margin: 0 }}>Card details</h4>
                      
                      {/* International Card Switch */}
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-muted)", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isInternationalCard}
                          onChange={(e) => setIsInternationalCard(e.target.checked)}
                          style={{ accentColor: "var(--brand)" }}
                        />
                        <Globe className="w-3.5 h-3.5" /> International Card
                      </label>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: "10px" }}>
                      <label style={{ fontSize: "0.75rem" }}>Card Number</label>
                      <div className="input-wrapper" style={{ position: "relative" }}>
                        <input
                          type="text"
                          className="text-input"
                          placeholder="4111 2222 3333 4444"
                          required
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          style={{ paddingRight: cardBrand ? "70px" : "12px" }}
                        />
                        {cardBrand && renderCardLogo(cardBrand)}
                      </div>
                      {cardBank && (
                        <div className="card-bank-indicator">
                          <Building2 className="w-3.5 h-3.5" /> {cardBank}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: "0.75rem" }}>Expiry Date</label>
                        <input
                          type="text"
                          className="text-input"
                          placeholder="MM/YY"
                          required
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: "0.75rem" }}>CVV</label>
                        <input
                          type="password"
                          className="text-input"
                          placeholder="123"
                          maxLength="4"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: "0.75rem" }}>Cardholder Name</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="John Doe"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Fields: UPI ID (INR only) */}
                {depositMethod === "upi" && checkoutCurrency === "INR" && (
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "8px", marginTop: "12px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: "0.75rem" }}>UPI ID</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="username@bank"
                        required
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Fields: Net Banking Real Simulator (INR only) */}
                {depositMethod === "netbanking" && checkoutCurrency === "INR" && (
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "8px", marginTop: "12px" }}>
                    {netbankStep === 1 ? (
                      <>
                        <h4 style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "8px" }}>Select Bank</h4>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "12px" }}>
                          {netBanks.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              className={`bank-grid-btn ${selectedNetbank === b.id ? "active" : ""}`}
                              onClick={() => setSelectedNetbank(b.id)}
                            >
                              {b.short}
                            </button>
                          ))}
                        </div>

                        <div className="form-group" style={{ borderTop: "1px solid var(--border-faint)", paddingTop: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                            <Lock className="w-3.5 h-3.5 text-zinc-500" />
                            <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)" }}>Secure Net Banking Gateway Login</span>
                          </div>
                          
                          <div style={{ marginBottom: "8px" }}>
                            <input
                              type="text"
                              className="text-input"
                              placeholder="Mock Netbanking User ID"
                              value={netbankUserId}
                              onChange={(e) => setNetbankUserId(e.target.value)}
                            />
                          </div>
                          <div>
                            <input
                              type="password"
                              className="text-input"
                              placeholder="Mock Password"
                              value={netbankPassword}
                              onChange={(e) => setNetbankPassword(e.target.value)}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: "center", padding: "10px 0" }}>
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: "600", marginBottom: "4px" }}>Verification Required</h4>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                          Simulating secure bank 2FA OTP verification for {selectedNetbank.toUpperCase()}...
                        </p>
                        <div style={{ maxWidth: "160px", margin: "0 auto" }}>
                          <input
                            type="text"
                            className="text-input"
                            style={{ textAlign: "center", letterSpacing: "4px", fontSize: "1rem" }}
                            placeholder="123456"
                            maxLength="6"
                            disabled
                          />
                        </div>
                        <span style={{ display: "inline-block", fontSize: "0.7rem", color: "var(--brand)", marginTop: "6px" }}>
                          Auto-completing in 2 seconds...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional Fields: PayPal (USD only) */}
                {depositMethod === "paypal" && checkoutCurrency === "USD" && (
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "8px", marginTop: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                      <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)" }}>Secure PayPal Express Gateway Login</span>
                    </div>
                    <div className="form-group" style={{ marginBottom: "10px" }}>
                      <label style={{ fontSize: "0.75rem" }}>PayPal Email ID</label>
                      <input
                        type="email"
                        className="text-input"
                        placeholder="email@example.com"
                        required
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: "0.75rem" }}>PayPal Account Password</label>
                      <input
                        type="password"
                        className="text-input"
                        placeholder="••••••••"
                        required
                        value={paypalPassword}
                        onChange={(e) => setPaypalPassword(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Conditional Fields: Apple Pay / Google Pay (USD only) */}
                {depositMethod === "applepay" && checkoutCurrency === "USD" && (
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "8px", marginTop: "12px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "12px" }}>
                      Complete express checkout instantly using your device's primary wallet.
                    </p>
                    <button
                      type="submit"
                      style={{
                        background: "#000",
                        color: "#fff",
                        border: "1px solid var(--border-strong)",
                        padding: "12px",
                        width: "100%",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                    >
                      <span style={{ background: "#fff", color: "#000", padding: "1px 6px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "900" }}> Pay</span>
                      <span>Express Checkout</span>
                    </button>
                  </div>
                )}

                {/* Conditional Fields: ACH / Wire (USD only) */}
                {depositMethod === "ach" && checkoutCurrency === "USD" && (
                  <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--border-subtle)", padding: "14px", borderRadius: "8px", marginTop: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)" }}>US Bank ACH Routing details</span>
                    </div>
                    <div className="form-group" style={{ marginBottom: "10px" }}>
                      <label style={{ fontSize: "0.75rem" }}>US Bank Name</label>
                      <input
                        type="text"
                        className="text-input"
                        placeholder="Chase, Bank of America"
                        required
                        value={achBankName}
                        onChange={(e) => setAchBankName(e.target.value)}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: "0.75rem" }}>ACH Routing Number</label>
                        <input
                          type="text"
                          className="text-input"
                          placeholder="021000021"
                          maxLength="9"
                          required
                          value={achRouting}
                          onChange={(e) => setAchRouting(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: "0.75rem" }}>Account Number</label>
                        <input
                          type="text"
                          className="text-input"
                          placeholder="123456789"
                          required
                          value={achAccount}
                          onChange={(e) => setAchAccount(e.target.value.replace(/\D/g, ""))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Transaction Charge breakout */}
                {amountNum > 0 && (
                  <div style={{ marginTop: "16px", padding: "12px", background: "rgba(6, 182, 212, 0.04)", border: "1px dashed rgba(6, 182, 212, 0.25)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span>Subtotal</span>
                      <span>{checkoutCurrency === "USD" ? "$" : "₹"}{amountNum.toLocaleString(checkoutCurrency === "USD" ? "en-US" : "en-IN")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {feeLabel} <HelpCircle className="w-3 h-3 text-zinc-500" />
                      </span>
                      <span>{checkoutCurrency === "USD" ? "$" : "₹"}{transactionFee.toLocaleString(checkoutCurrency === "USD" ? "en-US" : "en-IN")}</span>
                    </div>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: "600", marginBottom: checkoutCurrency === "USD" ? "6px" : "0" }}>
                      <span>Total Amount to Pay</span>
                      <span style={{ color: "var(--brand)" }}>{checkoutCurrency === "USD" ? "$" : "₹"}{totalAmountToPay.toLocaleString(checkoutCurrency === "USD" ? "en-US" : "en-IN")}</span>
                    </div>
                    {checkoutCurrency === "USD" && (
                      <div style={{ fontSize: "0.75rem", color: "#10b981", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px", marginTop: "4px" }}>
                        * Wallet will be credited: <strong>₹{creditAmountINR.toLocaleString("en-IN")} INR</strong> (1 USD = ₹83.50 conversion)
                      </div>
                    )}
                  </div>
                )}

              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => {
                  setIsDepositModalOpen(false);
                  setNetbankStep(1);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-brand" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="loader" style={{ display: "block" }}></div>
                  ) : (
                    <span>
                      {depositMethod === "netbanking" && netbankStep === 1 ? "Connect Securely" : `Pay ${checkoutCurrency === "USD" ? "$" : "₹"}${totalAmountToPay}`}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${showToast ? "show" : ""}`}>
        <span>✓</span> {toastMessage}
      </div>
    </div>
  );
}
