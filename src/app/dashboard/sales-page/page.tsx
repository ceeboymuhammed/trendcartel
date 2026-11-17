"use client";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";
import { useState } from "react";
import { FileText, Copy, ExternalLink, Globe, Check, Sparkles } from "lucide-react";

export default function SalesPageBuilderUI() {
  const [market, setMarket] = useState<"nigeria" | "global">("nigeria");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Page Builder</h1>
            <p className="text-slate-500 text-sm">High-converting sales copy ready to paste into Selar or Gumroad[cite: 14, 20]</p>
          </div>
        </div>

        {/* Dual Market Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setMarket("nigeria")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              market === "nigeria" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600"
            }`}
          >
            Phase 1: Selar (₦)
          </button>
          <button
            onClick={() => setMarket("global")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              market === "global" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
            }`}
          >
            Phase 2: Gumroad / Whop ($)
          </button>
        </div>
      </div>

      {/* Product Details Form */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Product Baseline</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Product Title</label>
            <input
              type="text"
              placeholder="e.g. Budget Meal Prep & Local Market Matrix"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-slate-800 text-xs focus:outline-none focus:border-pink-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Price</label>
            <input
              type="text"
              placeholder={market === "nigeria" ? "₦5,000" : "$29.00"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-slate-800 text-xs focus:outline-none focus:border-pink-600"
            />
          </div>
        </div>

        <button className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Generate Sales Copy
        </button>
      </div>

      {/* Generated Copy Preview Box */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-150 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">Generated Copy Preview</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
              {market === "nigeria" ? "Optimized for Selar (Nigeria)" : "Optimized for Gumroad (Global)"}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy to Clipboard"}
          </button>
        </div>

        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60 font-sans text-xs text-slate-800 space-y-3 leading-relaxed">
          <p className="font-bold text-sm text-slate-900">
            {market === "nigeria"
              ? "Stop throwing away money on fake food items and overpriced supermarket staples."
              : "The Minimalist Notion Grocery & Meal Architecture."}
          </p>
          <p>
            {market === "nigeria"
              ? "Are you tired of spending ₦150,000 every month only to run out of food by week 3? This blueprint breaks down wholesale market maps, bulk preservation tricks, and low-cost recipes designed specifically for Nigeria."
              : "Automate your weekly meal prep and grocery spend in one frictionless dashboard. Designed for remote workers and busy professionals who want to eat healthy without spending hours planning."}
          </p>
          <div className="font-semibold text-slate-900">What’s Included:</div>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Plug-and-play budget trackers</li>
            <li>Direct vendor and market substitution swipe files</li>
            <li>Step-by-step video guide for rapid setup</li>
          </ul>
        </div>
      </div>
    </div>
  );
}