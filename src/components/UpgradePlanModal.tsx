"use client";

import { useState } from "react";
import {
  X,
  Check,
  Sparkles,
  MessageCircle,
  Lock,
  Clock,
  Coins,
  ShieldCheck,
} from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  getWhatsAppSubscribeUrl,
  PlanTier,
} from "@/lib/billing/plans";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: PlanTier;
  currentCredits?: number;
  userEmail?: string;
  lockReason?: "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS" | "MANUAL_UPGRADE";
}

export default function UpgradePlanModal({
  isOpen,
  onClose,
  currentTier = "free",
  currentCredits = 25,
  userEmail = "",
  lockReason = "MANUAL_UPGRADE",
}: UpgradePlanModalProps) {
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [emailInput, setEmailInput] = useState(userEmail);

  if (!isOpen) return null;

  const handleSubscribeClick = (planId: "starter" | "pro") => {
    const plan = SUBSCRIPTION_PLANS[planId];
    const priceLabel = currency === "NGN" ? plan.priceNGN : plan.priceUSD;
    const url = getWhatsAppSubscribeUrl({
      planName: plan.name,
      credits: plan.credits,
      priceLabel,
      userEmail: emailInput || userEmail,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Contextual Alert Banner */}
        {lockReason === "FREE_TIER_TOOL_LOCKED" && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <strong className="block text-sm font-extrabold mb-0.5">
                Free Tier Limit Reached (1 Tool Max)
              </strong>
              Free accounts can complete <strong>1 tool workflow</strong> and keep project details for <strong>7 days</strong>. Subscribe to Creator or Pro below to unlock all 5 AI engines and permanent storage.
            </div>
          </div>
        )}

        {lockReason === "INSUFFICIENT_CREDITS" && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <Coins className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-950 leading-relaxed">
              <strong className="block text-sm font-extrabold mb-0.5">
                Not Enough Wallet Credits ({currentCredits} left)
              </strong>
              Top up your monthly credit allocation via WhatsApp to continue building products, funnels, and launch plans.
            </div>
          </div>
        )}

        {/* Header + Currency Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#6D28D9] text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Instant WhatsApp Activation
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Upgrade Your TrendCartel Wallet
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a plan below to message our activation desk on WhatsApp (+234 802 652 1855).
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-bold self-start">
            <button
              type="button"
              onClick={() => setCurrency("NGN")}
              className={`px-3.5 py-1.5 rounded-full transition ${
                currency === "NGN" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              ₦ Naira
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-3.5 py-1.5 rounded-full transition ${
                currency === "USD" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
              }`}
            >
              $ USD
            </button>
          </div>
        </div>

        {/* Account Email Confirmation Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">
              Account Email for Credit Top-Up
            </span>
            <span className="text-slate-500">
              Included automatically in your WhatsApp order message so we credit the right wallet.
            </span>
          </div>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 font-medium w-full sm:w-64 focus:outline-none focus:border-[#6D28D9]"
          />
        </div>

        {/* 3-Column Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* FREE TIER */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {SUBSCRIPTION_PLANS.free.name}
                </span>
                {currentTier === "free" && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                    Current Plan
                  </span>
                )}
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900">
                  {currency === "NGN" ? "₦0" : "$0"}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-0.5">
                  25 one-time credits
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Saved task history expires after 7 days</span>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-600">
                {SUBSCRIPTION_PLANS.free.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              disabled
              className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 text-xs font-bold cursor-not-allowed"
            >
              {currentTier === "free" ? "Active Trial Tier" : "Free Tier"}
            </button>
          </div>

          {/* STARTER / CREATOR PLAN (100 CREDITS) */}
          <div className="rounded-2xl border-2 border-[#6D28D9] bg-white p-5 flex flex-col justify-between space-y-5 shadow-md relative">
            <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#6D28D9] text-white text-[10px] font-extrabold uppercase tracking-wider">
              Most Popular
            </span>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#6D28D9]">
                  {SUBSCRIPTION_PLANS.starter.name}
                </span>
                {currentTier === "starter" && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6D28D9] text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>

              <div>
                <div className="text-2xl font-black text-slate-900">
                  {currency === "NGN"
                    ? SUBSCRIPTION_PLANS.starter.priceNGN
                    : SUBSCRIPTION_PLANS.starter.priceUSD}
                </div>
                <div className="text-xs font-bold text-emerald-700 mt-0.5">
                  ⚡ 100 Credits / month
                </div>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-700">
                {SUBSCRIPTION_PLANS.starter.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSubscribeClick("starter")}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Subscribe via WhatsApp
            </button>
          </div>

          {/* PRO / AGENCY PLAN (500 CREDITS) */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  {SUBSCRIPTION_PLANS.pro.name}
                </span>
                {currentTier === "pro" && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                    Active
                  </span>
                )}
              </div>

              <div>
                <div className="text-2xl font-black text-white">
                  {currency === "NGN"
                    ? SUBSCRIPTION_PLANS.pro.priceNGN
                    : SUBSCRIPTION_PLANS.pro.priceUSD}
                </div>
                <div className="text-xs font-bold text-amber-400 mt-0.5">
                  ⚡ 500 Credits / month
                </div>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-300">
                {SUBSCRIPTION_PLANS.pro.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSubscribeClick("pro")}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Subscribe via WhatsApp
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Direct payment verification on WhatsApp (+234 802 652 1855) · Credits activated within minutes.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-700 hover:underline"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}