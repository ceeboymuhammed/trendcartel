"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Coins,
  TrendingUp,
  Loader2,
  ArrowRight,
  Globe,
  Flame,
  CheckCircle2,
  Clock,
  FolderCheck,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";

export default function DiscoveryEnginePage() {
  const { wallet, checkCanRunTool, recordToolUsage } = useWallet();
  const credits = wallet.credits;
  const [upgradeReason, setUpgradeReason] = useState<
    "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS" | "MANUAL_UPGRADE" | null
  >(null);

  const [query, setQuery] = useState("");
  const [market, setMarket] = useState<"Nigeria" | "Global" | "Both">("Both");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const savedSearches = wallet.savedTasks.filter((t) => t.toolKey === "discovery");

  const handleAnalyzeKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!query.trim()) {
      setError("Enter a niche, skill, or buyer problem to validate.");
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
          keyword: query,
          market,
          userId: wallet.userId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.code === "FREE_TIER_TOOL_LOCKED" || json.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(json.code);
          return;
        }
        throw new Error(json.error || "Failed to analyze market demand.");
      }

      const payload = json.data || json;
      setResult(payload);
      recordToolUsage({
        toolKey: "discovery",
        creditCost: cost,
        taskTitle: query,
        taskPayload: payload,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              Naija + Tier-1 Discovery Engine
            </h1>
            <p className="text-xs text-slate-500">
              Validate live buyer demand across Selar, Gumroad, Nairaland & Reddit (⚡ 5 credits)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setUpgradeReason("MANUAL_UPGRADE")}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-bold self-start sm:self-auto"
        >
          <Coins className="w-4 h-4 text-amber-600" />
          <span>{credits} Credits Left</span>
        </button>
      </div>

      {/* Saved Search Banner (7-day retention notice on Free tier) */}
      {savedSearches.length > 0 && !result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <FolderCheck className="w-4 h-4 text-sky-600 shrink-0" />
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
            View Saved Report
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Search Form */}
      <form
        onSubmit={handleAnalyzeKeyword}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. UK Care Visa CV, Meal Prep for Busy Mums, Shopify Dropshipping..."
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#6D28D9]"
          />

          <select
            value={market}
            onChange={(e) => setMarket(e.target.value as "Nigeria" | "Global" | "Both")}
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
          >
            <option value="Both">🇳🇬 Naija + 🌍 Tier-1</option>
            <option value="Nigeria">🇳🇬 Nigeria (Selar)</option>
            <option value="Global">🌍 Global (Gumroad / Etsy)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" /> Validate Niche (⚡ 5 cr)
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Demand Score: {result.demandScore || 84}/100
                  </span>
                  {wallet.planTier === "free" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                      <Clock className="w-3 h-3" /> Saved for 7 days
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  Market Validation: “{result.keyword || query}”
                </h2>
              </div>

              <Link
                href={`/dashboard/monetisation?topic=${encodeURIComponent(result.keyword || query)}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                Build Product From This <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {result.summary && (
              <p className="text-xs text-slate-600 leading-relaxed">{result.summary}</p>
            )}

            {/* Sub-niches / Buyer Angles */}
            {Array.isArray(result.opportunities) && result.opportunities.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.opportunities.map((opp: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        {opp.title || opp.subNiche || opp}
                      </span>
                      <Flame className="w-4 h-4 text-amber-500" />
                    </div>
                    {opp.painPoint && (
                      <p className="text-xs text-slate-600">{opp.painPoint}</p>
                    )}
                    {opp.suggestedPrice && (
                      <div className="text-[11px] font-mono font-bold text-emerald-700">
                        {opp.suggestedPrice}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Live Search Phrases */}
            {Array.isArray(result.relatedKeywords) && result.relatedKeywords.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-600" /> High-Intent Buyer Search Queries
                </span>
                <div className="flex flex-wrap gap-2">
                  {result.relatedKeywords.map((kw: any, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200/70 text-sky-900 text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-sky-600" />
                      {typeof kw === "string" ? kw : kw.keyword || kw.term}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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