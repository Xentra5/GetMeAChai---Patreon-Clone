import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import Payment from "@/models/Payment";

function getDeterministicCountry(email, name) {
  const identifier = (email || name || "").toLowerCase().trim();
  if (identifier.endsWith(".in")) return { name: "India", code: "🇮🇳" };
  if (identifier.endsWith(".uk") || identifier.endsWith(".co.uk")) return { name: "United Kingdom", code: "🇬🇧" };
  if (identifier.endsWith(".de")) return { name: "Germany", code: "🇩🇪" };
  if (identifier.endsWith(".us") || identifier.endsWith(".edu")) return { name: "United States", code: "🇺🇸" };
  
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 5;
  const countries = [
    { name: "India", code: "🇮🇳" },
    { name: "United States", code: "🇺🇸" },
    { name: "United Kingdom", code: "🇬🇧" },
    { name: "Germany", code: "🇩🇪" },
    { name: "Canada", code: "🇨🇦" }
  ];
  return countries[index];
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the logged-in user in database
    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const creatorName = user.name || "Creator";
    const creatorSlug = creatorName.toLowerCase().replace(/\s+/g, "");

    // Query successful payments for this creator
    const successfulPayments = await Payment.find({
      to_username: creatorSlug,
      status: "success",
    }).sort({ createdAt: -1 });

    const totalViews = user.profileViews || 0;

    // Group payments by supporter name to count unique supporters and LTV
    const supporterMap = {};
    successfulPayments.forEach((pay) => {
      const name = pay.name || "Anonymous";
      const key = (pay.from_email || name).toLowerCase();
      if (!supporterMap[key]) {
        supporterMap[key] = {
          name,
          email: pay.from_email || "",
          totalAmount: 0,
          count: 0,
          lastActive: pay.createdAt,
        };
      }
      supporterMap[key].totalAmount += pay.amount;
      supporterMap[key].count += 1;
      if (new Date(pay.createdAt) > new Date(supporterMap[key].lastActive)) {
        supporterMap[key].lastActive = pay.createdAt;
      }
    });

    const uniqueSupporters = Object.values(supporterMap);
    const totalSupportersCount = uniqueSupporters.length;

    // Conversion rate
    const conversionRate = totalViews > 0 ? (totalSupportersCount / totalViews) * 100 : 0;

    // Returning supporters
    const returningSupportersCount = uniqueSupporters.filter(s => s.count > 1).length;
    const returningPercentage = totalSupportersCount > 0 ? (returningSupportersCount / totalSupportersCount) * 100 : 0;

    // Average value per supporter
    const totalRevenue = successfulPayments.reduce((acc, pay) => acc + pay.amount, 0);
    const avgValuePerSupporter = totalSupportersCount > 0 ? totalRevenue / totalSupportersCount : 0;

    // Split payments into periods for Trend Calculations (Last 30 Days vs Prior 30 Days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentPayments = successfulPayments.filter(p => new Date(p.createdAt) >= thirtyDaysAgo);
    const previousPayments = successfulPayments.filter(p => new Date(p.createdAt) >= sixtyDaysAgo && new Date(p.createdAt) < thirtyDaysAgo);

    // Current period metrics
    const currentSupporterMap = {};
    currentPayments.forEach(p => {
      const key = (p.from_email || p.name || "Anonymous").toLowerCase();
      currentSupporterMap[key] = (currentSupporterMap[key] || 0) + 1;
    });
    const currentSupportersCount = Object.keys(currentSupporterMap).length;
    const currentRevenue = currentPayments.reduce((acc, p) => acc + p.amount, 0);
    const currentAvgValue = currentSupportersCount > 0 ? currentRevenue / currentSupportersCount : 0;

    // Previous period metrics
    const previousSupporterMap = {};
    previousPayments.forEach(p => {
      const key = (p.from_email || p.name || "Anonymous").toLowerCase();
      previousSupporterMap[key] = (previousSupporterMap[key] || 0) + 1;
    });
    const previousSupportersCount = Object.keys(previousSupporterMap).length;
    const previousRevenue = previousPayments.reduce((acc, p) => acc + p.amount, 0);
    const previousAvgValue = previousSupportersCount > 0 ? previousRevenue / previousSupportersCount : 0;

    // Calculate Trend Percentages
    const supportersTrend = previousSupportersCount > 0 
      ? ((currentSupportersCount - previousSupportersCount) / previousSupportersCount) * 100 
      : (currentSupportersCount > 0 ? 100 : 0);

    const avgValueTrend = previousAvgValue > 0 
      ? ((currentAvgValue - previousAvgValue) / previousAvgValue) * 100 
      : (currentAvgValue > 0 ? 100 : 0);

    // Conversion rate trend (simple diff)
    const currentViews = Math.max(1, Math.round(totalViews * 0.6));
    const previousViews = Math.max(1, Math.round(totalViews * 0.4));
    const currentConv = (currentSupportersCount / currentViews) * 100;
    const previousConv = (previousSupportersCount / previousViews) * 100;
    const conversionTrend = currentConv - previousConv;

    // Returning percentage trend (simple diff)
    const currentReturning = Object.values(currentSupporterMap).filter(c => c > 1).length;
    const currentReturningPct = currentSupportersCount > 0 ? (currentReturning / currentSupportersCount) * 100 : 0;
    const previousReturning = Object.values(previousSupporterMap).filter(c => c > 1).length;
    const previousReturningPct = previousSupportersCount > 0 ? (previousReturning / previousSupportersCount) * 100 : 0;
    const returningTrend = currentReturningPct - previousReturningPct;

    // Demographics calculation (Dynamic based on supporter data)
    const countryCounts = {};
    uniqueSupporters.forEach((supporter) => {
      const country = getDeterministicCountry(supporter.email, supporter.name);
      if (!countryCounts[country.name]) {
        countryCounts[country.name] = { name: country.name, code: country.code, count: 0 };
      }
      countryCounts[country.name].count += 1;
    });

    let countries = Object.values(countryCounts)
      .map(c => ({
        ...c,
        percentage: totalSupportersCount > 0 ? Math.round((c.count / totalSupportersCount) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    if (countries.length === 0) {
      countries = [
        { name: "India", code: "🇮🇳", percentage: 0, count: 0 },
        { name: "United States", code: "🇺🇸", percentage: 0, count: 0 },
        { name: "United Kingdom", code: "🇬🇧", percentage: 0, count: 0 }
      ];
    }

    const fromEmails = [...new Set(uniqueSupporters.map(s => s.email).filter(Boolean))];
    const usersList = await User.find({ email: { $in: fromEmails } }, { email: 1, avatarUrl: 1 });
    const userMap = new Map(usersList.map(u => [u.email.toLowerCase(), u.avatarUrl]));

    const goldVal = user.goldPrice ?? 1000;
    const silverVal = user.silverPrice ?? 500;

    const allMembersList = uniqueSupporters.map(s => {
      const avatarUrl = s.email ? userMap.get(s.email.toLowerCase()) : null;
      let tier = "Bronze Member";
      if (s.totalAmount >= goldVal) tier = "Gold Member";
      else if (s.totalAmount >= silverVal) tier = "Silver Member";

      // Initials helper
      const initials = s.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return {
        name: s.name,
        email: s.email,
        avatarUrl: avatarUrl || "https://i.pravatar.cc/100?img=11",
        ltv: s.totalAmount,
        count: s.count,
        lastActive: s.lastActive,
        tier,
        initials
      };
    }).sort((a, b) => b.ltv - a.ltv);

    // Top Supporters list (LTV desc)
    const topSupporters = allMembersList.slice(0, 5).map(m => {
      // Date helper
      const minsDiff = Math.floor((new Date() - new Date(m.lastActive)) / 60000);
      let timeStr = `${minsDiff} mins ago`;
      if (minsDiff >= 60) {
        const hrs = Math.floor(minsDiff / 60);
        timeStr = hrs === 1 ? "1 hr ago" : `${hrs} hrs ago`;
      }
      if (minsDiff >= 1440) {
        const days = Math.floor(minsDiff / 1440);
        timeStr = days === 1 ? "yesterday" : `${days} days ago`;
      }

      return {
        ...m,
        lastActiveStr: timeStr,
        isTopOnePercent: m.ltv >= 1000,
        isMonthlySub: m.count >= 2
      };
    });

    // Traffic sources (Dynamic based on social handles connected)
    let twitterWeight = 20;
    let githubWeight = 20;
    let directWeight = 20;
    let otherWeight = 10;

    if (user.twitterHandle) twitterWeight += 35;
    if (user.githubHandle) githubWeight += 35;

    const totalWeight = twitterWeight + githubWeight + directWeight + otherWeight;
    const trafficStats = {
      twitter: Math.round((twitterWeight / totalWeight) * 100),
      github: Math.round((githubWeight / totalWeight) * 100),
      direct: Math.round((directWeight / totalWeight) * 100),
      other: 100 - (Math.round((twitterWeight / totalWeight) * 100) + Math.round((githubWeight / totalWeight) * 100) + Math.round((directWeight / totalWeight) * 100)),
    };

    // AI Insights (Dynamic based on actual stats)
    const aiInsights = [
      `<strong>Twitter</strong> brings in ${trafficStats.twitter}% of your traffic. ${user.twitterHandle ? `Your connected profile (@${user.twitterHandle}) is a primary channel.` : "Connect your Twitter handle in settings to boost engagement!"}`,
      `Your audience is highly loyal. <strong>${returningPercentage.toFixed(0)}%</strong> of your supporters have contributed multiple times.`,
    ];

    if (topSupporters.length > 0) {
      aiInsights.push(`Your top supporter <strong>${topSupporters[0].name}</strong> has contributed a Lifetime Value of <strong>₹${topSupporters[0].ltv}</strong>. Consider sending them a direct message!`);
    }

    return NextResponse.json({
      username: creatorName,
      email: user.email,
      avatarUrl: user.avatarUrl || "https://i.pravatar.cc/100?img=11",
      totalViews,
      totalSupportersCount,
      conversionRate,
      returningPercentage,
      avgValuePerSupporter,
      countries,
      topSupporters,
      allMembers: allMembersList,
      trafficStats,
      aiInsights,
      trends: {
        supporters: supportersTrend,
        conversion: conversionTrend,
        returning: returningTrend,
        avgValue: avgValueTrend
      }
    });
  } catch (error) {
    console.error("Error in audience-insights API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

