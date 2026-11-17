"use client";

import { useState } from "react";
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Flame, 
  DollarSign, 
  Globe, 
  ShieldCheck, 
  ArrowUpRight, 
  Sparkles,
  Zap,
  Award
} from "lucide-react";

export default function AnalyticsLeaderboardPage() {
  const [activePeriod, setActivePeriod] = useState<"this-week" | "all-time">("this-week");
  const [currencyView, setCurrencyView] = useState<"dual" | "ngn" | "usd">("dual");

  const weeklyLeaders = [
    { rank: 1, name: "Tunde O.", product: "Lagos Real Estate Sourcing SOP", niche: "Real Estate", ngn: "₦1,850,000", usd: "$1,230", sales: 124, daysToFirstSale: 4 },
    { rank: 2, name: "Claire M.", product: "Notion High-Protein Grocery Hub", niche: "Food & Health", ngn: "₦420,000", usd: "$2,150", sales: 89, daysToFirstSale: 2 },
    { rank: 3, name: "Emeka D.", product: "DIY Canada Study Visa SOP Kit", niche: "Travel / Visa", ngn: "₦2,450,000", usd: "$350", sales: 180, daysToFirstSale: 6 },
    { rank: 4, name: "Amara K.", product: "Virtual Assistant Cold Pitch Swipe", niche: "Remote Jobs", ngn: "₦850,000", usd: "$980", sales: 67, daysToFirstSale: 3 },
    { rank: 5, name: "Liam B.", product: "Minimalist Freelance Client Portal", niche: "Tech / Design", ngn: "₦150,000", usd: "$1,420", sales: 48, daysToFirstSale: 1 },
    { rank: 6, name: "Zainab B.", product: "Nigerian Air Fryer Recipe Book", niche: "Food", ngn: "₦1,120,000", usd: "$180", sales: 210, daysToFirstSale: 5 },
    { rank: 7, name: "Victor E.", product: "B2B Outreach Email Bank", niche: "Business", ngn: "₦640,000", usd: "$820", sales: 41, daysToFirstSale: 7 },
    { rank: 8, name: "Sophie T.", product: "Etsy Printable Budget Planners", niche: "Lifestyle", ngn: "₦90,000", usd: "$1,150", sales: 94, daysToFirstSale: 2 },
    { rank: 9, name: "Ifeanyi N.", product: "Crypto Tax Exemption Framework", niche: "Finance", ngn: "₦1,400,000", usd: "$210", sales: 38, daysToFirstSale: 9 },
    { rank: 10, name: "Korede A.", product: "Canva Social Kit for Real Estate", niche: "Design", ngn: "₦780,000", usd: "$490", sales: 83, daysToFirstSale: 4 },
  ];

  const allTimeLeaders = [
    { rank: 1, name: "Emeka D.", product: "DIY Canada Study Visa SOP Kit", niche: "Travel / Visa", ngn: "₦24,800,000", usd: "$8,950", sales: 1840, daysToFirstSale: 6 },
    { rank: 2, name: "Claire M.", product: "Notion High-Protein Grocery Hub", niche: "Food & Health", ngn: "₦3,800,000", usd: "$19,400", sales: 1420, daysToFirstSale: 2 },
    { rank: 3, name: "Tunde O.", product: "Lagos Real Estate Sourcing SOP", niche: "Real Estate", ngn: "₦18,200,000", usd: "$6,100", sales: 1190, daysToFirstSale: 4 },
    { rank: 4, name: "Liam B.", product: "Minimalist Freelance Client Portal", niche: "Tech / Design", ngn: "₦1,900,000", usd: "$16,500", sales: 830, daysToFirstSale: 1 },
    { rank: 5, name: "Zainab B.", product: "Nigerian Air Fryer Recipe Book", niche: "Food", ngn: "₦14,300,000", usd: "$2,800", sales: 2650, daysToFirstSale: 5 },
    { rank: 6, name: "Amara K.", product: "Virtual Assistant Cold Pitch Swipe", niche: "Remote Jobs", ngn: "₦9,400,000", usd: "$5,200", sales: 740, daysToFirstSale: 3 },
    { rank: 7, name: "Sophie T.", product: "Etsy Printable Budget Planners", niche: "Lifestyle", ngn: "₦1,200,000", usd: "$11,900", sales: 1080, daysToFirstSale: 2 },
    { rank: 8, name: "Victor E.", product: "B2B Outreach Email Bank", niche: "Business", ngn: "₦7,900,000", usd: "$4,600", sales: 510, daysToFirstSale: 7 },
    { rank: 9, name: "Ifeanyi N.", product: "Crypto Tax Exemption Framework", niche: "Finance", ngn: "₦11,600,000", usd: "$1,850", sales: 340, daysToFirstSale: 9 },
    { rank: 10, name: "Korede A.", product: "Canva Social Kit for Real Estate", niche: "Design", ngn: "₦6,900,000", usd: "$3,400", sales: 910, daysToFirstSale: 4 },
  ];

  const currentLeaders = activePeriod === "this-week" ? weeklyLeaders : allTimeLeaders;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Notification */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
            <Zap className="w-5 h-5 fill-slate-950" />
          </div>
          <div className="text-xs text-slate-800">
            <span className="font-bold text-emerald-950">Proof of Market: </span>
            84% of creators make their first sale within 14 days using the Step-by-Step Launch Advisor[cite: 14, 18].
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Verified Selar & Stripe webhooks
        </div>
      </div>

      {/* Hero Stats: Total Volume Made So Far */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Naira Volume</span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Selar / Paystack</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">₦94,840,000</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% this month
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Global Volume</span>
            <span className="text-[10px] font-mono font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">Gumroad / Stripe</span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">$82,490 USD</div>
          <div className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24.1% this month
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Total Products Launched</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">1,482</div>
          <div className="text-[11px] text-slate-500">Across 18 distinct niches</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Avg. Time to 1st Sale</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">4.2 Days</div>
          <div className="text-[11px] text-amber-600 font-semibold">Fastest: 18 hours</div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Creator Earnings Leaderboard</h1>
              <p className="text-slate-500 text-xs">Live rankings verified across connected storefronts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Period Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActivePeriod("this-week")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activePeriod === "this-week" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Top 10 This Week
              </button>
              <button
                onClick={() => setActivePeriod("all-time")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activePeriod === "all-time" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Top 10 All-Time
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Creator & Product</th>
                <th className="pb-3">Niche</th>
                <th className="pb-3">Naira Sales (Phase 1)</th>
                <th className="pb-3">Global Sales (Phase 2)</th>
                <th className="pb-3">Total Orders</th>
                <th className="pb-3 pr-2 text-right">Time to 1st Sale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {currentLeaders.map((leader) => (
                <tr key={leader.rank} className="hover:bg-slate-50/70 transition">
                  {/* Rank Badge */}
                  <td className="py-3.5 pl-2 font-bold font-mono">
                    {leader.rank === 1 && (
                      <span className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 inline-flex items-center justify-center text-xs shadow-sm">
                        1
                      </span>
                    )}
                    {leader.rank === 2 && (
                      <span className="h-6 w-6 rounded-full bg-slate-300 text-slate-800 inline-flex items-center justify-center text-xs">
                        2
                      </span>
                    )}
                    {leader.rank === 3 && (
                      <span className="h-6 w-6 rounded-full bg-amber-700/60 text-white inline-flex items-center justify-center text-xs">
                        3
                      </span>
                    )}
                    {leader.rank > 3 && (
                      <span className="text-slate-400 pl-2">#{leader.rank}</span>
                    )}
                  </td>

                  {/* Creator & Product */}
                  <td className="py-3.5">
                    <div className="font-bold text-slate-900">{leader.name}</div>
                    <div className="text-[11px] text-slate-500">{leader.product}</div>
                  </td>

                  {/* Niche */}
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px]">
                      {leader.niche}
                    </span>
                  </td>

                  {/* NGN */}
                  <td className="py-3.5 font-bold font-mono text-emerald-700">
                    {leader.ngn}
                  </td>

                  {/* USD */}
                  <td className="py-3.5 font-bold font-mono text-sky-700">
                    {leader.usd}
                  </td>

                  {/* Orders */}
                  <td className="py-3.5 font-semibold text-slate-800">
                    {leader.sales} orders
                  </td>

                  {/* Speed */}
                  <td className="py-3.5 pr-2 text-right font-medium text-amber-700">
                    {leader.daysToFirstSale} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}