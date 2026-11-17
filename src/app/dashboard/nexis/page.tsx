"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Zap,
  Megaphone,
  Bot,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Lock,
  Plus,
  Coins,
  FileText,
  Image as ImageIcon,
  Loader2,
  Download,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";

function CartelStudioContent() {
  const searchParams = useSearchParams();
  const incomingTopic = searchParams.get("topic") || "";

  // Navigation sub-views: "hub" | "free-post" | "paid-ad"
  const [view, setView] = useState<"hub" | "free-post" | "paid-ad">("hub");

  // Wallet Credit System
  const { wallet, checkCanRunTool, recordToolUsage } = useWallet();
  const credits = wallet.credits;
  const [upgradeReason, setUpgradeReason] = useState<
    "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS" | null
  >(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Common Form States
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [topic, setTopic] = useState(incomingTopic);
  const [buyerPain, setBuyerPain] = useState("");
  const [tone, setTone] = useState("Relatable Naija Street-Smart");
  const [onCamera, setOnCamera] = useState<"yes" | "no">("no");
  const [buyLink, setBuyLink] = useState("");

  // Free Post Specific
  const [platform, setPlatform] = useState("WhatsApp Status / Broadcast");

  // Paid Ad Specific
  const [adSpend, setAdSpend] = useState("5000");
  const [currency, setCurrency] = useState("₦ NGN");
  const [payoutDestination, setPayoutDestination] = useState(
    "Selar (Naira Bank Transfers & Cards)"
  );

  // Generation Output State
  const [generating, setGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (incomingTopic) {
      setTopic(incomingTopic);
    }
  }, [incomingTopic]);

  const handleGenerate = async (creditCost: number, type: "free" | "paid") => {
    setErrorMessage(null);

    const guard = checkCanRunTool("studio", creditCost);
    if (!guard.allowed) {
      setUpgradeReason(guard.reason);
      return;
    }

    if (!productName.trim() || !topic.trim() || !buyerPain.trim()) {
      setErrorMessage(
        "Please complete the required fields: Product Name, Topic, and Buyer Problem."
      );
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          productName,
          productType,
          topic,
          buyerPain,
          tone,
          onCamera,
          buyLink,
          platform,
          adSpend,
          currency,
          payoutDestination,
          userId: wallet.userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "FREE_TIER_TOOL_LOCKED" || data.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(data.code);
          return;
        }
        throw new Error(data.error || "Failed to generate content.");
      }

      recordToolUsage({
        toolKey: "studio",
        creditCost,
        taskTitle: productName,
        taskPayload: data.script,
      });
      setGeneratedScript(data.script);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsTxt = () => {
    if (!generatedScript) return;
    const blob = new Blob([generatedScript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "cartel-studio"}-copy.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Bar: Cartel Studio Header + Dynamic Credit Wallet */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-[#6D28D9] flex items-center justify-center text-white shadow-sm shrink-0">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cartel Studio</h1>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                Text Engine Live
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              High-converting social copy, WhatsApp launch slides, threads & ad scripts
            </p>
          </div>
        </div>

        {/* Live Wallet / Credits Badge */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 font-semibold text-xs">
            <Coins className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>
              <strong className="text-amber-950 font-bold">{credits}</strong> Credits in Wallet
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowBuyModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Credits
          </button>
        </div>
      </div>

      {/* VIEW 1: STUDIO HUB */}
      {view === "hub" && (
        <div className="space-y-6">
          {/* Active Text Generation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Post Option */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Zap className="w-5 h-5 fill-purple-700" />
                    <h2 className="font-bold text-slate-900 text-lg">Organic Post & Script</h2>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                    ⚡ 5 credits
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  You post it yourself and spend ₦0 on ads. Generates WhatsApp Status slide copy,
                  X/Twitter threads, LinkedIn posts, or short-form video scripts tailored to your
                  niche.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setView("free-post")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Write organic post / script
              </button>
            </div>

            {/* Paid Ad Option */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Megaphone className="w-5 h-5 text-slate-700" />
                    <h2 className="font-bold text-slate-900 text-lg">Paid Ad Copy & Blueprint</h2>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                    ⚡ 5 credits
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Direct-response copy for Facebook & Instagram Ads. Pre-checks Naira or USD daily
                  budgets, writes 3 ad copy hooks, and gives exact Ads Manager targeting settings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setView("paid-ad")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-250 bg-white text-slate-800 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Write paid ad copy
              </button>
            </div>
          </div>

          {/* Coming Soon Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 opacity-90">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <ImageIcon className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      AI Image & Carousel Generator
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border border-slate-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      COMING SOON
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Turn your generated text scripts into branded WhatsApp Status graphic cards,
                    Instagram carousels, and ad creatives automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 opacity-90">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <Bot className="w-5 h-5 text-slate-700" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">
                      Message & Comment Auto-Manager
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold border border-slate-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-400" />
                      COMING SOON
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Connect your Instagram, X, and WhatsApp handles to auto-reply to comments and
                    send your Selar or Gumroad checkout links straight to visitor DMs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FREE POST & ORGANIC SCRIPT WRITER */}
      {view === "free-post" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <button
              type="button"
              onClick={() => {
                setView("hub");
                setGeneratedScript(null);
                setErrorMessage(null);
              }}
              className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Organic Post & Script</h2>
            <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 ml-auto">
              Cost: 5 credits
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form */}
            <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your first sale</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fill in the details below to generate high-converting text tailored to your
                  platform.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                    1
                  </span>
                  What are you selling? *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name (e.g. Lagos Food Bulk Prep Matrix)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
                <input
                  type="text"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  placeholder="Format & Price (e.g. Notion Template · ₦5,000 / $19)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                    2
                  </span>
                  What is the niche or topic? *
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Budget Meal Planning, Remote Tech Jobs, Study Visa SOP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                      3
                    </span>
                    Where are you posting?
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="WhatsApp Status / Broadcast">WhatsApp Status / Broadcast</option>
                    <option value="Twitter / X Thread">Twitter / X Thread</option>
                    <option value="LinkedIn Post">LinkedIn Post</option>
                    <option value="TikTok / Instagram Reels">TikTok / Instagram Reels</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 block">
                    Voice & Cultural Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="Relatable Naija Street-Smart">
                      Relatable Naija Street-Smart
                    </option>
                    <option value="Corporate / Professional">Corporate / Professional</option>
                    <option value="Global Tier-1 Creator">Global Tier-1 Creator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                    4
                  </span>
                  Who is this one buyer, and what are they stuck on? *
                </label>
                <textarea
                  rows={2}
                  value={buyerPain}
                  onChange={(e) => setBuyerPain(e.target.value)}
                  placeholder="e.g. A 9-to-5 worker in Lagos tired of spending ₦120k monthly on random groceries"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                    5
                  </span>
                  Delivery style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setOnCamera("no")}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      onCamera === "no"
                        ? "border-purple-600 bg-purple-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">Text-only / Faceless</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Status slides, threads & screen shots.
                    </div>
                  </div>
                  <div
                    onClick={() => setOnCamera("yes")}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      onCamera === "yes"
                        ? "border-purple-600 bg-purple-50/50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900">
                      Talking head / On camera
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Spoken script with camera cues.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-mono">
                    6
                  </span>
                  Where do people buy it? (Optional)
                </label>
                <input
                  type="text"
                  value={buyLink}
                  onChange={(e) => setBuyLink(e.target.value)}
                  placeholder="Paste Selar or Gumroad link (or leave blank for DM CTA)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleGenerate(5, "free")}
                disabled={generating}
                className="w-full py-3.5 bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {generating ? "Writing Your Copy..." : "Write my post / script"}
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] ml-1">
                  ⚡ 5 credits
                </span>
              </button>
            </div>

            {/* Right Side: Live Output Viewport */}
            <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm min-h-[540px] flex flex-col justify-between">
              {generatedScript ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Ready-to-Post Copy
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {platform} · {tone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={downloadAsTxt}
                        className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        <Download className="w-3.5 h-3.5" /> .TXT
                      </button>
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-xs font-bold text-purple-700 hover:bg-purple-100"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "Copied" : "Copy Text"}
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80 max-h-[520px] overflow-y-auto">
                    {generatedScript}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center my-auto p-6 space-y-3">
                  <FileText className="w-10 h-10 text-slate-300" />
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Your post, WhatsApp status slides, or spoken script appears here — formatted
                    cleanly and ready to copy-paste.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PAID AD COPY PLANNER */}
      {view === "paid-ad" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <button
              type="button"
              onClick={() => {
                setView("hub");
                setGeneratedScript(null);
                setErrorMessage(null);
              }}
              className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-9 w-9 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Paid Ad Copy & Blueprint</h2>
            <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200 ml-auto">
              Cost: 5 credits
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form */}
            <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Your first paid ad</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  We calibrate ad copy, targeting, and daily budget thresholds before you spend
                  money.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  1. What are you selling? *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    2. Where do people pay?
                  </label>
                  <select
                    value={payoutDestination}
                    onChange={(e) => setPayoutDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-800"
                  >
                    <option value="Selar (Naira Bank Transfers & Cards)">
                      Selar (Naira Bank Transfers)
                    </option>
                    <option value="Gumroad / Stripe (USD / GBP)">
                      Gumroad / Stripe (USD / GBP)
                    </option>
                    <option value="Direct WhatsApp DM Closing">Direct WhatsApp DM Closing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">Voice & Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-800"
                  >
                    <option value="Relatable Naija Street-Smart">
                      Relatable Naija Street-Smart
                    </option>
                    <option value="Corporate / Professional">Corporate / Professional</option>
                    <option value="Global Tier-1 Creator">Global Tier-1 Creator</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">3. Niche or Topic *</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Study Visa Self-Application, Personal Finance"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  4. Who is this one buyer, and what are they stuck on? *
                </label>
                <textarea
                  rows={2}
                  value={buyerPain}
                  onChange={(e) => setBuyerPain(e.target.value)}
                  placeholder="One real person, and the one thing that keeps going wrong for them"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">
                  5. How much can you spend a day?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="col-span-1 px-3 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-800"
                  >
                    <option value="₦ NGN">₦ NGN</option>
                    <option value="$ USD">$ USD</option>
                    <option value="£ GBP">£ GBP</option>
                  </select>
                  <input
                    type="number"
                    value={adSpend}
                    onChange={(e) => setAdSpend(e.target.value)}
                    className="col-span-2 px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800">6. Destination Link</label>
                <input
                  type="url"
                  value={buyLink}
                  onChange={(e) => setBuyLink(e.target.value)}
                  placeholder="Paste the Selar or Gumroad link people click"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              <button
                type="button"
                onClick={() => handleGenerate(5, "paid")}
                disabled={generating}
                className="w-full py-3.5 bg-[#6D28D9] hover:bg-[#5B21B6] disabled:opacity-50 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center justify-center gap-2"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Megaphone className="w-4 h-4" />
                )}
                {generating ? "Generating Ad Blueprint..." : "Write my ad"}
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] ml-1">
                  ⚡ 5 credits
                </span>
              </button>
            </div>

            {/* Right Side: Ad Blueprint Viewport */}
            <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm min-h-[540px] flex flex-col justify-between">
              {generatedScript ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                    <span className="text-xs font-bold text-slate-900">Your Paid Ad Blueprint</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={downloadAsTxt}
                        className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                      >
                        <Download className="w-3.5 h-3.5" /> .TXT
                      </button>
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-xs font-bold text-purple-700 hover:bg-purple-100"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "Copied" : "Copy Blueprint"}
                      </button>
                    </div>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-800 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200/80 max-h-[520px] overflow-y-auto">
                    {generatedScript}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center my-auto p-6 space-y-3">
                  <Megaphone className="w-10 h-10 text-slate-300" />
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Your ad copy, targeting parameters, and daily budget thresholds appear here
                    ready to paste into Meta Ads Manager.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Subscription & Credit Top-Up Modal */}
      <UpgradePlanModal
        isOpen={upgradeReason !== null || showBuyModal}
        onClose={() => {
          setUpgradeReason(null);
          setShowBuyModal(false);
        }}
        currentTier={wallet.planTier}
        currentCredits={wallet.credits}
        userEmail={wallet.email}
        lockReason={upgradeReason || "MANUAL_UPGRADE"}
      />
    </div>
  );
}

export default function CartelStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-slate-400">Loading Cartel Studio...</div>
      }
    >
      <CartelStudioContent />
    </Suspense>
  );
}