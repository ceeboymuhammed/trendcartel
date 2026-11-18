"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  Loader2,
  Coins,
  TrendingUp,
  ExternalLink,
  Download,
  ChevronDown,
  ChevronUp,
  Clock,
  FolderCheck,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";

const CATEGORIES = [
  "All",
  "Fitness",
  "Business",
  "Finance",
  "Food",
  "Lifestyle",
  "Tech",
  "Gaming",
  "Education",
  "Beauty",
  "Travel",
];

export default function KeywordResearchPage() {
  const { wallet, checkCanRunTool, recordToolUsage } = useWallet();
  const credits = wallet.credits;
  const [upgradeReason, setUpgradeReason] = useState<
    "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS" | "MANUAL_UPGRADE" | null
  >(null);

  const [selectedCat, setSelectedCat] = useState("All");
  const [country, setCountry] = useState("Nigeria");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [relatedExpanded, setRelatedExpanded] = useState(true);

  const savedSearches = wallet.savedTasks.filter((t) => t.toolKey === "discovery");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setErrorMsg("Please enter a valid keyword or topic.");
      return;
    }

    const cost = TOOL_CREDIT_COSTS.discovery; // 5 credits
    const guard = checkCanRunTool("discovery", cost);
    if (!guard.allowed) {
      setUpgradeReason(guard.reason);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: trimmedQuery,
          country,
          category: selectedCat,
          userId: wallet.userId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.code === "FREE_TIER_TOOL_LOCKED" || json.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(json.code);
          return;
        }
        throw new Error(json.error || "Search failed");
      }

      const payload = json.data || json;
      setResult(payload);
      setRelatedExpanded(true);

      recordToolUsage({
        toolKey: "discovery",
        creditCost: cost,
        taskTitle: trimmedQuery,
        taskPayload: payload,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch keyword data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRelatedCsv = () => {
    if (!result?.relatedKeywords?.length) return;
    const rows = [
      ["Keyword", "Monthly Volume", "Opportunity Score (/10)", "Country"],
      ...result.relatedKeywords.map((rk: any) => [
        `"${String(rk.keyword || "").replace(/"/g, '""')}"`,
        `"${rk.volume || ""}"`,
        rk.score ?? "",
        `"${result.country || country}"`,
      ]),
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(result.query || query || "keywords").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-related-keywords.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Keyword Research</h1>
            <p className="text-slate-500 text-xs">
              Discover high-opportunity topics, X/Nairaland sentiment &amp; live competing products
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUpgradeReason("MANUAL_UPGRADE")}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 font-semibold text-xs self-start sm:self-auto"
        >
          <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
          <span>
            <strong>{credits}</strong> Credits
          </span>
        </button>
      </div>

      {/* Saved Search Banner (7-day retention notice on Free tier) */}
      {savedSearches.length > 0 && !result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <FolderCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">
                Recent Search: {savedSearches[0].title}
              </span>
              {savedSearches[0].expiresAt && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                  <Clock className="w-3 h-3" /> Expires in 7 days (Free Tier)
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setResult(savedSearches[0].payload)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto"
          >
            Re-open Saved Report
          </button>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition shrink-0 ${
              selectedCat === cat
                ? "bg-[#6D28D9] text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4"
      >
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a topic e.g. 'Healthy living', 'Budget meal prep', 'Remote jobs'..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-purple-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white flex items-center justify-center transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUpRight className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600">Country:</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5"
            >
              <option value="Nigeria">Nigeria (NGN Validation)</option>
              <option value="United States">United States (USD Scale)</option>
              <option value="United Kingdom">United Kingdom (GBP Scale)</option>
            </select>
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            ⚡ 5 credits per search
          </span>
        </div>
      </form>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-2xl">
          {errorMsg}
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: Overview Score & Single Action Button */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Keyword analysis</span>
                  {wallet.planTier === "free" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      <Clock className="w-3 h-3" /> Saved for 7 days
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Overview: {result.query}
                </h2>

                {/* Score Display */}
                <div className="my-6 text-center space-y-1">
                  <div className="text-5xl font-black text-amber-500">
                    {result.overallScore ?? result.demandScore ?? 8.2}
                  </div>
                  <div className="text-xs text-slate-400">Overall score, out of 10</div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-4 text-center py-4 border-y border-slate-100">
                  <div>
                    <div className="text-[11px] text-slate-400">
                      Monthly searches in {result.country || country}
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                      {result.monthlySearches || "24K"}
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                      {result.competition || "low ad competition"}
                    </span>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400">Trend</div>
                    <div className="text-lg font-bold text-slate-800 mt-2 flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      {result.trendDirection || "Rising"}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-4">
                  {result.summaryParagraph || result.summary}
                </p>
              </div>

              {/* Streamlined Single Handoff Button */}
              <div className="pt-2">
                <Link
                  href={`/dashboard/monetisation?topic=${encodeURIComponent(result.query || query)}&auto=true`}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <TrendingUp className="w-4 h-4" />
                  Build a product from this keyword
                </Link>
              </div>
            </div>

            {/* Right Card: Expandable Related Keywords Table + CSV Export */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-400">Keywords related to your search</div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">Related keywords</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Monthly searches in {result.country || country}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {Array.isArray(result.relatedKeywords) && result.relatedKeywords.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadRelatedCsv}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setRelatedExpanded(!relatedExpanded)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title={relatedExpanded ? "Collapse list" : "Expand list"}
                  >
                    {relatedExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {relatedExpanded && Array.isArray(result.relatedKeywords) && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="py-3 px-4">Keyword</th>
                        <th className="py-3 px-4">Volume</th>
                        <th className="py-3 px-4 text-right">Score /10</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.relatedKeywords.map((rk: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-4 font-medium text-slate-800">{rk.keyword}</td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono">{rk.volume}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="inline-block px-2 py-0.5 rounded bg-amber-100/80 text-amber-800 font-bold font-mono text-[11px]">
                              {rk.score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Live X (Twitter) & Nairaland Sentiment Pulse */}
          {result.socialPulse && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Live Market Sentiment: X (Twitter) &amp; Nairaland
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {result.socialPulse.sentimentSummary}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold self-start">
                  Real-Time Social Proof
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* X (Twitter) Column */}
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    What People Are Saying on X (Twitter)
                  </div>
                  {result.socialPulse.twitter?.length > 0 ? (
                    result.socialPulse.twitter.map((post: any, i: number) => (
                      <a
                        key={i}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:border-sky-400 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                            {post.sentimentTag || "Discussion"}
                          </span>
                          <span className="text-[10px] text-slate-400">Open on X ↗</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {post.title}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {post.snippet}
                        </p>
                      </a>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                      No indexed X threads matched that exact phrase — try a broader 2-word niche term.
                    </div>
                  )}
                </div>

                {/* Nairaland Column */}
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    Nairaland Forum Threads &amp; Buyer Questions
                  </div>
                  {result.socialPulse.nairaland?.length > 0 ? (
                    result.socialPulse.nairaland.map((post: any, i: number) => (
                      <a
                        key={i}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:border-emerald-500 transition space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {post.sentimentTag || "Thread"}
                          </span>
                          <span className="text-[10px] text-slate-400">View Thread ↗</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1">
                          {post.title}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {post.snippet}
                        </p>
                      </a>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                      No indexed Nairaland threads matched that exact phrase — try a broader Nigerian market term.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Live Marketplace Products (Selar, Gumroad, Etsy) */}
          {Array.isArray(result.liveProducts) && result.liveProducts.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Live Products Selling in This Niche
                </h3>
                <p className="text-xs text-slate-500">
                  Click any listing to inspect real pricing, reviews, and structure on Selar,
                  Gumroad, and Etsy
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.liveProducts.map((prod: any, idx: number) => (
                  <a
                    key={idx}
                    href={prod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-2xl border border-slate-200 hover:border-purple-500 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            prod.platform === "Selar"
                              ? "bg-emerald-100 text-emerald-800"
                              : prod.platform === "Gumroad"
                              ? "bg-pink-100 text-pink-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {prod.platform}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {prod.priceEstimate}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-xs group-hover:text-purple-700 line-clamp-2">
                        {prod.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{prod.snippet}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-purple-700">
                      <span>Inspect live listing</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Subscription & Upgrade Modal */}
      <UpgradePlanModal
        isOpen={upgradeReason !== null}
        onClose={() => setUpgradeReason(null)}
        currentTier={wallet.planTier}
        currentCredits={wallet.credits}
        userEmail={wallet.email}
        lockReason={upgradeReason || "MANUAL_UPGRADE"}
      />
    </div>
  );
}