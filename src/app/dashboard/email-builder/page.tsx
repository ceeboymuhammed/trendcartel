"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Coins,
  Plus,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  MessageCircle,
  Gift,
  Clock,
  FolderCheck,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";

interface SavedProduct {
  id: string;
  title: string;
  niche: string;
  format: string;
  author?: string;
}

function EmailListBuilderContent() {
  const searchParams = useSearchParams();
  const incomingTitle = searchParams.get("title") || "";

  // Wallet & Enforcement State
  const { wallet, checkCanRunTool, recordToolUsage } = useWallet();
  const credits = wallet.credits;
  const [upgradeReason, setUpgradeReason] = useState<
    "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS" | "MANUAL_UPGRADE" | null
  >(null);

  // Saved Products from Monetisation AI
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [selectionMode, setSelectionMode] = useState<"existing" | "custom">("existing");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Form Inputs
  const [productTitle, setProductTitle] = useState(incomingTitle);
  const [niche, setNiche] = useState("");
  const [format, setFormat] = useState("Digital Toolkit / Planner");
  const [pricePoint, setPricePoint] = useState("₦6,500 / $19");
  const [targetAudience, setTargetAudience] = useState(
    "Busy professionals & beginners looking for fast results"
  );
  const [leadMagnetHook, setLeadMagnetHook] = useState(
    "Free 1-Page Quick-Start Checklist & Mistake Guide"
  );
  const [tone, setTone] = useState("Relatable Naija Street-Smart");
  const [checkoutLink, setCheckoutLink] = useState("");

  // Generation Output State
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [funnelData, setFunnelData] = useState<any | null>(null);
  const [openEmailDay, setOpenEmailDay] = useState<number | null>(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Saved funnel tasks governed by 7-day (free) / permanent (paid) wallet retention
  const savedFunnels = wallet.savedTasks.filter((t) => t.toolKey === "email_builder");

  // Load previously generated products from localStorage + URL query
  useEffect(() => {
    try {
      const raw = localStorage.getItem("trendcartel_products");
      const parsed: SavedProduct[] = raw ? JSON.parse(raw) : [];

      if (incomingTitle && !parsed.some((p) => p.title === incomingTitle)) {
        const urlProd: SavedProduct = {
          id: "url-incoming",
          title: incomingTitle,
          niche: incomingTitle,
          format: "Digital Product",
        };
        parsed.unshift(urlProd);
      }

      setSavedProducts(parsed);

      if (parsed.length > 0) {
        const initial = incomingTitle
          ? parsed.find((p) => p.title === incomingTitle) || parsed[0]
          : parsed[0];
        setSelectionMode("existing");
        setSelectedProductId(initial.id);
        setProductTitle(initial.title);
        setNiche(initial.niche || initial.title);
        setFormat(initial.format || "Digital Product");
      } else {
        setSelectionMode("custom");
      }
    } catch {
      setSelectionMode("custom");
    }
  }, [incomingTitle]);

  const handleSelectSavedProduct = (id: string) => {
    setSelectedProductId(id);
    const found = savedProducts.find((p) => p.id === id);
    if (found) {
      setProductTitle(found.title);
      setNiche(found.niche || found.title);
      setFormat(found.format || "Digital Product");
    }
  };

  const handleGenerateFunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!productTitle.trim()) {
      setErrorMsg("Please select one of your generated products or type a new product name.");
      return;
    }

    const cost = TOOL_CREDIT_COSTS.email_builder; // 15 credits
    const guard = checkCanRunTool("email_builder", cost);
    if (!guard.allowed) {
      setUpgradeReason(guard.reason);
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/email-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle,
          niche: niche || productTitle,
          format,
          pricePoint,
          targetAudience,
          leadMagnetHook,
          tone,
          checkoutLink: checkoutLink || "https://selar.com/m/your-product",
          userId: wallet.userId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.code === "FREE_TIER_TOOL_LOCKED" || json.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(json.code);
          return;
        }
        throw new Error(json.error || "Failed to build email funnel.");
      }

      setFunnelData(json.funnel);
      setOpenEmailDay(1);

      recordToolUsage({
        toolKey: "email_builder",
        creditCost: cost,
        taskTitle: productTitle,
        taskPayload: json.funnel,
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong generating your email sequence.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadFullFunnel = () => {
    if (!funnelData) return;
    const lines: string[] = [
      `EMAIL & WHATSAPP CONVERSION FUNNEL: ${productTitle.toUpperCase()}`,
      `Lead Magnet Hook: ${funnelData.optInHeadline}`,
      `Subheadline: ${funnelData.optInSubheadline}`,
      `\n========================================\n5-DAY AUTOMATED EMAIL SEQUENCE\n========================================\n`,
      ...(funnelData.emails || []).map(
        (em: any) =>
          `DAY ${em.day} (${em.timing}) — ${em.angle}\nSubject: ${em.subjectLine}\nPreview: ${em.previewText}\n\n${em.body}\n\n----------------------------------------\n`
      ),
      `\n========================================\nWHATSAPP BROADCAST FOLLOW-UPS\n========================================\n`,
      ...(funnelData.whatsappFollowUps || []).map((wa: any) => `${wa.stage}\n${wa.message}\n\n`),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-email-funnel.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Email &amp; WhatsApp List Builder
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Turn cold visitors into subscribers and buyers with a 5-day email sequence + WhatsApp
              broadcast flow (⚡ 15 credits)
            </p>
          </div>
        </div>

        {/* Live Wallet */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 font-semibold text-xs">
            <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>
              <strong className="text-amber-950 font-bold">{credits}</strong> Credits
            </span>
          </div>
          <button
            type="button"
            onClick={() => setUpgradeReason("MANUAL_UPGRADE")}
            className="px-3.5 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Credits
          </button>
        </div>
      </div>

      {/* Saved Funnel Banner (7-day retention notice on Free tier) */}
      {savedFunnels.length > 0 && !funnelData && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs">
            <FolderCheck className="w-4 h-4 text-blue-600 shrink-0" />
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
            onClick={() => {
              setProductTitle(savedFunnels[0].title);
              setFunnelData(savedFunnels[0].payload);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold self-start sm:self-auto"
          >
            Re-open Saved Funnel
          </button>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Picker & Funnel Configuration */}
        <form
          onSubmit={handleGenerateFunnel}
          className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              1. Choose Product to Promote
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select one of your built products or enter a new offer manually.
            </p>
          </div>

          {/* Toggle: Pick from Generated Products vs Enter New */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setSelectionMode("existing");
                if (savedProducts.length > 0) {
                  handleSelectSavedProduct(savedProducts[0].id);
                }
              }}
              className={`py-2 rounded-lg transition ${
                selectionMode === "existing"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              My Built Products ({savedProducts.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectionMode("custom");
                setProductTitle("");
                setNiche("");
              }}
              className={`py-2 rounded-lg transition ${
                selectionMode === "custom"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              + New Product
            </button>
          </div>

          {/* Product Input Area */}
          {selectionMode === "existing" && savedProducts.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Select Generated Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectSavedProduct(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600"
              >
                {savedProducts.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.title} ({prod.format})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              {selectionMode === "existing" && savedProducts.length === 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                  No saved products found from Monetisation AI yet. Enter your product details
                  below:
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="e.g. The Side Hustle Setup Planner"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Niche / Topic
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Personal Finance"
                    className="w-full px-3 py-2 rounded-xl border border-slate-250 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Format</label>
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="e.g. Notion System"
                    className="w-full px-3 py-2 rounded-xl border border-slate-250 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lead Magnet & Offer Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Free Lead Magnet Hook (To capture emails)
              </label>
              <input
                type="text"
                value={leadMagnetHook}
                onChange={(e) => setLeadMagnetHook(e.target.value)}
                placeholder="e.g. Free 1-Page Checklist or 3-Day Mini Guide"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Offer Price</label>
                <input
                  type="text"
                  value={pricePoint}
                  onChange={(e) => setPricePoint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-250 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Voice &amp; Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-250 bg-white text-xs text-slate-800"
                >
                  <option value="Relatable Naija Street-Smart">Relatable Naija Street-Smart</option>
                  <option value="Corporate / Professional">Corporate / Professional</option>
                  <option value="Global Tier-1 Creator">Global Tier-1 Creator</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Buyer</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Storefront Checkout Link (Selar / Gumroad)
              </label>
              <input
                type="text"
                value={checkoutLink}
                onChange={(e) => setCheckoutLink(e.target.value)}
                placeholder="https://selar.com/m/your-product"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={generating}
            className="w-full py-3.5 bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {generating ? "Writing 5-Day Funnel..." : "Generate Email & WhatsApp Funnel"}
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] ml-1">
              ⚡ 15 credits
            </span>
          </button>
        </form>

        {/* Right Column: Funnel Output Viewport */}
        <div className="lg:col-span-7 space-y-5">
          {!funnelData ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-sm min-h-[480px] flex flex-col items-center justify-center space-y-3">
              <Mail className="w-11 h-11 text-slate-300" />
              <h3 className="text-base font-bold text-slate-800">
                Your Conversion Funnel Appears Here
              </h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Pick one of your built products on the left to generate an opt-in capture headline,
                a 5-day automated email sequence, and WhatsApp follow-up broadcasts.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Top Export Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
                      Complete Funnel Ready
                    </span>
                    {wallet.planTier === "free" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                        <Clock className="w-3 h-3" /> Saved for 7 days
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">{productTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadFullFunnel}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" /> Download Full Funnel (.TXT)
                </button>
              </div>

              {/* Opt-In Page Capture Box */}
              <div className="bg-white border border-blue-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-800 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-blue-600" /> Step 1: Lead Magnet Opt-In Page Copy
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        "optin",
                        `${funnelData.optInHeadline}\n\n${funnelData.optInSubheadline}`
                      )
                    }
                    className="text-xs font-bold text-blue-700 flex items-center gap-1"
                  >
                    {copiedId === "optin" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedId === "optin" ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                  <div className="font-extrabold text-slate-900 text-sm">
                    {funnelData.optInHeadline}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {funnelData.optInSubheadline}
                  </p>
                  <div className="text-[11px] text-blue-900 font-medium pt-1">
                    <strong>Freebie Deliverable:</strong> {funnelData.leadMagnetDeliverable}
                  </div>
                </div>
              </div>

              {/* 5-Day Email Sequence Accordions */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider px-1">
                  Step 2: 5-Day Automated Email Sequence
                </h3>

                {(funnelData.emails || []).map((em: any) => {
                  const isOpen = openEmailDay === em.day;
                  const copyKey = `email-${em.day}`;
                  return (
                    <div
                      key={em.day}
                      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenEmailDay(isOpen ? null : em.day)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/70 transition"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                              DAY {em.day}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {em.timing} · {em.angle}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            Subject: {em.subjectLine}
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-3 border-t border-slate-100 bg-slate-50/40 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              <strong>Preview text:</strong> {em.previewText}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(copyKey, `Subject: ${em.subjectLine}\n\n${em.body}`)
                              }
                              className="px-3 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold flex items-center gap-1 hover:bg-purple-200"
                            >
                              {copiedId === copyKey ? (
                                <Check className="w-3 h-3 text-emerald-700" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {copiedId === copyKey ? "Copied" : "Copy Email"}
                            </button>
                          </div>

                          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                            {em.body}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* WhatsApp Broadcast Follow-Ups */}
              {funnelData.whatsappFollowUps && funnelData.whatsappFollowUps.length > 0 && (
                <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>
                      Step 3: WhatsApp Broadcast &amp; Status Follow-Ups (Nigeria High-Convert)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {funnelData.whatsappFollowUps.map((wa: any, idx: number) => {
                      const waKey = `wa-${idx}`;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-950">{wa.stage}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(waKey, wa.message)}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                            >
                              {copiedId === waKey ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                              {copiedId === waKey ? "Copied" : "Copy"}
                            </button>
                          </div>
                          <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed">
                            {wa.message}
                          </pre>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

export default function EmailListBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">
          Loading Email List Builder...
        </div>
      }
    >
      <EmailListBuilderContent />
    </Suspense>
  );
}