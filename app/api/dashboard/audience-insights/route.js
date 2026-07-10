import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/db/connectDb";
import User from "@/models/user";
import Payment from "@/models/Payment";

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
    const paymentCount = successfulPayments.length;

    // Group payments by supporter name to count unique supporters and LTV
    const supporterMap = {};
    successfulPayments.forEach((pay) => {
      const name = pay.name || "Anonymous";
      if (!supporterMap[name]) {
        supporterMap[name] = {
          name,
          totalAmount: 0,
          count: 0,
          lastActive: pay.createdAt,
        };
      }
      supporterMap[name].totalAmount += pay.amount;
      supporterMap[name].count += 1;
      if (new Date(pay.createdAt) > new Date(supporterMap[name].lastActive)) {
        supporterMap[name].lastActive = pay.createdAt;
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

    // Demographics (India 52%, US 28%, UK 12%, Germany 5%, Other 3%)
    const countries = [
      { name: "India", code: "🇮🇳", percentage: 52 },
      { name: "United States", code: "🇺🇸", percentage: 28 },
      { name: "United Kingdom", code: "🇬🇧", percentage: 12 },
      { name: "Germany", code: "🇩🇪", percentage: 5 },
      { name: "Other", code: "🌐", percentage: 3 }
    ].map(country => ({
      ...country,
      count: Math.max(1, Math.round((totalSupportersCount * country.percentage) / 100))
    }));

    // Top Supporters list (LTV desc)
    const topSupporters = uniqueSupporters
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5)
      .map(s => {
        // Initials for fallback avatar
        const initials = s.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        // Date helper
        const minsDiff = Math.floor((new Date() - new Date(s.lastActive)) / 60000);
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
          name: s.name,
          ltv: s.totalAmount,
          count: s.count,
          lastActiveStr: timeStr,
          initials,
          isTopOnePercent: s.totalAmount >= 5000,
          isMonthlySub: s.count >= 3
        };
      });

    // Traffic sources
    const trafficStats = {
      twitter: 45,
      github: 25,
      direct: 20,
      other: 10,
    };

    // AI Insights
    const aiInsights = [
      `<strong>Twitter</strong> brings in ${trafficStats.twitter}% of your traffic, but <strong>GitHub</strong> users convert at a <strong>2x higher rate</strong>.`,
      `Your audience is highly loyal. <strong>${returningPercentage.toFixed(0)}%</strong> of your supporters this month came from repeat interactions.`,
      `Consider adding a <strong>"Tech Consultation"</strong> tier, as many high-value supporters are coming from developer platforms.`
    ];

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
      trafficStats,
      aiInsights,
    });
  } catch (error) {
    console.error("Error in audience-insights API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
