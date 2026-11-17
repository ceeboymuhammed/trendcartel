"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Coins,
  Sparkles,
  Loader2,
  Copy,
  Check,
  MessageCircle,
  Send,
  Clock,
  FolderCheck,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";

function EmailListBuilderContent() {
  const searchParams = useSearchParams();
  const incomingTitle = searchParams.get("title") || "";
  const incomingNiche = searchParams.get("niche") || "";

  const { wallet, checkCanRunTool, recordToolUsage } = useWallet();
  const credits = wallet.credits;
  const [upgradeReason, setUpgradeReason] = useState<
    "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS" | "MANUAL_UPGRADE" | null
  >(null);

  const [productTitle, setProductTitle] = useState(incomingTitle);
  const [niche, setNiche] = useState(incomingNiche || "Digital Products & Creator Economy");
  const [format, setFormat] = useState("Digital Toolkit / PDF");
  const [pricePoint, setPricePoint] = useState("₦6,500 / $19");
  const [targetAudience, setTargetAudience] = useState("Beginners & busy professionals");
  const [leadMagnetHook, setLeadMagnetHook] = useState("Free 1-Page Quick-Start Checklist");
  const [tone, setTone] = useState("Relatable Naija Street-Smart");
  const [checkoutLink, setCheckoutLink] = useState("https://selar.com/m/your-product");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [funnelData, setFunnelData] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (incomingTitle) setProductTitle(incomingTitle);
    if (incomingNiche) setNiche(incomingNiche);
  }, [incomingTitle, incomingNiche]);

  // Restore any non-expired saved funnel task from the user's 7-day / permanent wallet history
  const savedFunnels = wallet.savedTasks.filter((t) => t.toolKey === "email_builder");

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!productTitle.trim()) {
      setError("Please enter your digital product name first.");
      return;
    }

    const cost = TOOL_CREDIT_COSTS.email_builder; // 15 credits
    const guard = checkCanRunTool("email_builder", cost);
    if (!guard.allowed) {
      setUpgradeReason(guard.reason);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/email-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle,
          niche,
          format,
          pricePoint,
          targetAudience,
          leadMagnetHook,
          tone,
          checkoutLink,
          userId: wallet.userId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.code === "FREE_TIER_TOOL_LOCKED" || json.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(json.code);
          return;
        }
        throw new Error(json.error || "Failed to build email & WhatsApp funnel.");
      }

      setFunnelData(json.funnel);
      recordToolUsage({
        toolKey: "email_builder",
        creditCost: cost,
        taskTitle: productTitle,
        taskPayload: json.funnel,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-pink-600 text-white flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              Email & WhatsApp Funnel Builder
            </h1>
            <p className="text-xs text-slate-500">
              Generate a 5-day email sequence + 3 WhatsApp broadcast closes (⚡ 15 credits)
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

      {/* Saved History Bar (Shows 7-day expiry notice on Free tier) */}
      {savedFunnels.length > 0 && !funnelData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <FolderCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-900">
                Recent Funnel: {savedFunnels[0].title}
              </span>
              {savedFunnels[0].expiresAt && (
                <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                  <Clock className="w-3 h-3" /> Expires in 7 days (Free Tier)
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFunnelData(savedFunnels[0].payload)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto"
          >
            Re-open Saved Funnel
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleGenerateFunnel}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="e.g. The 30-Day Remote Job Landing Toolkit"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Niche / Market
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Product Format
            </label>
            <input
              type="text"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Price Point (₦ / $)
            </label>
            <input
              type="text"
              value={pricePoint}
              onChange={(e) => setPricePoint(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Copywriting Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
            >
              <option value="Relatable Naija Street-Smart">Relatable Naija Street-Smart</option>
              <option value="Global Tier-1 Direct Response">Global Tier-1 Direct Response</option>
              <option value="Warm & Educational">Warm & Educational</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Free Lead Magnet Hook
            </label>
            <input
              type="text"
              value={leadMagnetHook}
              onChange={(e) => setLeadMagnetHook(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Selar / Gumroad Checkout Link
            </label>
            <input
              type="text"
              value={checkoutLink}
              onChange={(e) => setCheckoutLink(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1">
            Target Buyer Profile
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-7 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs inline-flex items-center gap-2 transition shadow-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Building 5-Day Email & WhatsApp Funnel...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Generate Complete Funnel (⚡ 15 Credits)
            </>
          )}
        </button>
      </form>

      {/* Output Results */}
      {funnelData && (
        <div className="space-y-6">
          {/* Opt-In Page Copy */}
          <div className="bg-white border border-purple-200 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700">
                Lead Capture / Opt-In Page Hook
              </span>
              {wallet.planTier === "free" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  <Clock className="w-3 h-3" /> Saved for 7 days
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900">{funnelData.optInHeadline}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{funnelData.optInSubheadline}</p>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
              <strong>Freebie Deliverable:</strong> {funnelData.leadMagnetDeliverable}
            </div>
          </div>

          {/* 5-Day Email Sequence */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#6D28D9]" /> 5-Day Email Conversion Sequence
            </h3>

            {funnelData.emails?.map((em: any, idx: number) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#6D28D9]">
                      DAY {em.day} · {em.timing} · {em.angle}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">
                      Subject: {em.subjectLine}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(`email-${idx}`, `Subject: ${em.subjectLine}\n\n${em.body}`)
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    {copiedId === `email-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Email
                      </>
                    )}
                  </button>
                </div>

                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed">
                  {em.body}
                </pre>
              </div>
            ))}
          </div>

          {/* WhatsApp Follow-Up Broadcasts */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" /> WhatsApp Broadcast & DM Closes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {funnelData.whatsappFollowUps?.map((wa: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="text-[11px] font-extrabold text-emerald-800 block">
                      {wa.stage}
                    </span>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed">
                      {wa.message}
                    </pre>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(`wa-${idx}`, wa.message)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    {copiedId === `wa-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy WhatsApp Message
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
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

export default function EmailListBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">
          Loading Email & WhatsApp Funnel Builder...
        </div>
      }
    >
      <EmailListBuilderContent />
    </Suspense>
  );
}