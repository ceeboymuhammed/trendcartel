"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Rocket,
  Coins,
  FolderOpen,
  Download,
  BookOpen,
  FileText,
  LayoutGrid,
  Dumbbell,
  GraduationCap,
  Package,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  Copy,
  Eye,
  Loader2,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { generateLaunchRoadmapHTML } from "@/lib/renderers/launchRoadmapHtml";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";

const PRODUCT_TYPES = [
  { id: "Ebook", label: "Ebook", icon: BookOpen },
  { id: "Printable Pack", label: "Printable Pack", icon: FileText },
  { id: "Notion Template", label: "Notion Template", icon: LayoutGrid },
  { id: "Challenge Kit", label: "Challenge Kit", icon: Dumbbell },
  { id: "Online Course", label: "Online Course", icon: GraduationCap },
  { id: "Other", label: "Other", icon: Package },
];

const PRICE_RANGES: Record<string, string[]> = {
  NGN: ["Free", "₦2,500–₦5,000", "₦5,500–₦12,000", "₦15,000–₦30,000", "₦35,000+"],
  USD: ["Free", "$1–$19", "$20–$49", "$50–$99", "$100+"],
  GBP: ["Free", "£1–£15", "£16–£39", "£40–£79", "£80+"],
  EUR: ["Free", "€1–€18", "€19–€45", "€46–€89", "€90+"],
};

const AUDIENCE_TIERS = [
  {
    id: "Under 500 followers",
    label: "Under 500 followers",
    badge: "🌱",
    tip: "Perfect. We'll focus your plan on borrowed audiences, WhatsApp Status storytelling, and direct outreach — the highest-converting tactics at this stage.",
  },
  {
    id: "500 – 2,000",
    label: "500 – 2,000",
    badge: "🌿",
    tip: "Great traction. We'll combine warm-up content threads with a 48-hour early-bird offer for your core followers.",
  },
  {
    id: "2,000 – 10,000",
    label: "2,000 – 10,000",
    badge: "🌳",
    tip: "Strong leverage. We'll structure a waitlist teaser week followed by a multi-channel launch sequence.",
  },
  {
    id: "10,000+",
    label: "10,000+",
    badge: "🚀",
    tip: "Scale mode. We'll map out a full segmented launch with scarcity bonuses and affiliate/repost triggers.",
  },
];

const CHANNELS = [
  "WhatsApp Status",
  "TikTok",
  "Instagram",
  "Twitter / X",
  "YouTube",
  "LinkedIn",
  "Email List",
];

const CONTENT_VIBES = [
  "Casual & Relatable",
  "Bold & Direct",
  "Professional & Polished",
  "Warm & Encouraging",
];

const FOUNDATION_CHECKS = [
  "I have an email list",
  "I've sold a product before",
  "I have a lead magnet",
  "I have a sales page ready",
  "I have testimonials or social proof",
  "This is my first product ever",
];

function LaunchAdvisorContent() {
  const searchParams = useSearchParams();
  const incomingTitle = searchParams.get("title") || "";

  const { wallet, checkCanRunTool, recordToolUsage } = useWallet();
  const credits = wallet.credits;
  const [upgradeReason, setUpgradeReason] = useState<
    "FREE_TIER_TOOL_LOCKED" | "INSUFFICIENT_CREDITS" | "MANUAL_UPGRADE" | null
  >(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Product
  const [productName, setProductName] = useState(incomingTitle);
  const [productType, setProductType] = useState("Printable Pack");
  const [currency, setCurrency] = useState<"NGN" | "USD" | "GBP" | "EUR">("NGN");
  const [priceRange, setPriceRange] = useState("₦5,500–₦12,000");
  const [niche, setNiche] = useState("");
  const [buyLink, setBuyLink] = useState("");
  const [importToast, setImportToast] = useState<string | null>(null);

  // Step 2: Audience
  const [audienceSize, setAudienceSize] = useState("Under 500 followers");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "WhatsApp Status",
    "Twitter / X",
    "Instagram",
  ]);
  const [contentVibe, setContentVibe] = useState("Bold & Direct");

  // Step 3: Launch
  const [launchDate, setLaunchDate] = useState("");
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [problemSolved, setProblemSolved] = useState("");

  // Step 4: Result
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [copiedDayIdx, setCopiedDayIdx] = useState<number | null>(null);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);

  // Saved launch plans governed by wallet 7-day (free) / permanent (paid) retention
  const savedPlans = wallet.savedTasks.filter((t) => t.toolKey === "launch_advisor");

  useEffect(() => {
    if (incomingTitle) setProductName(incomingTitle);
  }, [incomingTitle]);

  const handleCurrencyChange = (nextCurr: "NGN" | "USD" | "GBP" | "EUR") => {
    setCurrency(nextCurr);
    setPriceRange(PRICE_RANGES[nextCurr][2]);
  };

  // Import latest product built in Monetisation AI
  const handleImportFromMonetisation = () => {
    try {
      const products = JSON.parse(localStorage.getItem("trendcartel_products") || "[]");
      if (products.length > 0) {
        const latest = products[0];
        setProductName(latest.title || "");
        setNiche(latest.niche || "");
        if (latest.format?.toLowerCase().includes("ebook")) setProductType("Ebook");
        else if (latest.format?.toLowerCase().includes("notion")) setProductType("Notion Template");
        else if (latest.format?.toLowerCase().includes("challenge")) setProductType("Challenge Kit");
        else setProductType("Printable Pack");

        setImportToast(`Imported "${latest.title}" from Monetisation AI!`);
        setTimeout(() => setImportToast(null), 3500);
      } else {
        setImportToast("No saved products found in Monetisation AI yet — fill in the fields below.");
        setTimeout(() => setImportToast(null), 3500);
      }
    } catch {
      setImportToast("Could not read local products.");
    }
  };

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? (prev.length > 1 ? prev.filter((c) => c !== ch) : prev) : [...prev, ch]
    );
  };

  const toggleFoundationCheck = (label: string) => {
    setCompletedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  // Readiness Score (0 - 100)
  const positiveChecks = completedItems.filter((i) => i !== "This is my first product ever");
  const readinessScore = Math.min(100, positiveChecks.length * 20);
  const readinessStage =
    readinessScore === 0
      ? { label: "Early Stage", desc: "Your plan will focus on building foundations before launching." }
      : readinessScore < 60
      ? { label: "Foundation Builder", desc: "We'll skip what you've done and focus on quick social proof." }
      : { label: "Launch Ready", desc: "You have strong assets — your plan jumps straight into high-converting buzz." };

  const handleGeneratePlan = async () => {
    setErrorMsg(null);
    if (!problemSolved.trim()) {
      setErrorMsg("Please describe what problem your product solves so we can write sharp launch hooks.");
      return;
    }

    const cost = TOOL_CREDIT_COSTS.launch_advisor; // 15 credits
    const guard = checkCanRunTool("launch_advisor", cost);
    if (!guard.allowed) {
      setUpgradeReason(guard.reason);
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/launch-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productType,
          priceRange,
          currency,
          niche,
          buyLink,
          audienceSize,
          channels: selectedChannels,
          contentVibe,
          launchDate,
          completedItems,
          problemSolved,
          userId: wallet.userId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "FREE_TIER_TOOL_LOCKED" || json.code === "INSUFFICIENT_CREDITS") {
          setUpgradeReason(json.code);
          return;
        }
        throw new Error(json.error || "Failed to generate launch plan.");
      }

      setGeneratedPlan(json.plan);
      setStep(4);

      recordToolUsage({
        toolKey: "launch_advisor",
        creditCost: cost,
        taskTitle: productName,
        taskPayload: { niche, plan: json.plan },
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildRoadmapHtmlString = () => {
    if (!generatedPlan) return "";
    return generateLaunchRoadmapHTML({
      productName,
      productType,
      niche,
      priceRange,
      currency,
      buyLink,
      audienceSize,
      channels: selectedChannels,
      contentVibe,
      launchDateLabel: launchDate || generatedPlan.optimalTimelineLabel || "Immediate Sprint",
      readinessLabel: readinessStage.label,
      strategySummary: generatedPlan.strategySummary,
      days: generatedPlan.days || [],
    });
  };

  const handleDownloadDesignedHtml = () => {
    const html = buildRoadmapHtmlString();
    const slug = productName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-launch-roadmap.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenAndPrintPdf = () => {
    const html = buildRoadmapHtmlString();
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => setTimeout(() => win.print(), 600);
    }
  };

  const activeAudienceObj = AUDIENCE_TIERS.find((a) => a.id === audienceSize) || AUDIENCE_TIERS[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Launch Advisor</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Get a personalised, day-by-day launch plan for your digital product (⚡ 15 credits).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <button
            type="button"
            onClick={() => setShowSavedDrawer(!showSavedDrawer)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-500" /> Saved plans ({savedPlans.length})
          </button>
          <button
            type="button"
            onClick={() => setUpgradeReason("MANUAL_UPGRADE")}
            className="px-3.5 py-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-950 font-bold text-xs inline-flex items-center gap-1.5"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> {credits} credits
          </button>
        </div>
      </div>

      {/* Saved Plans Drawer (with 7-day Free Tier Retention notice) */}
      {showSavedDrawer && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold text-slate-900">Previously Generated Launch Plans</div>
            {wallet.planTier === "free" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
                <Clock className="w-3 h-3" /> Free tier plans expire after 7 days
              </span>
            )}
          </div>
          {savedPlans.length === 0 ? (
            <p className="text-xs text-slate-400">No saved plans yet.</p>
          ) : (
            <div className="space-y-2">
              {savedPlans.map((sp) => {
                const payload = sp.payload as { niche?: string; plan?: any };
                return (
                  <div
                    key={sp.id}
                    onClick={() => {
                      setProductName(sp.title);
                      setNiche(payload?.niche || "");
                      setGeneratedPlan(payload?.plan || sp.payload);
                      setStep(4);
                      setShowSavedDrawer(false);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-slate-900">{sp.title}</span>
                    <span className="text-emerald-700 font-semibold">Open Roadmap →</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {importToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          ✓ {importToast}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* 3-Step Wizard Card (Steps 1 - 3) */}
      {step <= 3 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                {step === 1 ? "Product" : step === 2 ? "Audience" : "Launch"}
              </h2>
            </div>

            {step === 1 && (
              <button
                type="button"
                onClick={handleImportFromMonetisation}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" /> Import from Monetisation AI
              </button>
            )}
          </div>

          {/* Horizontal 3-Step Indicator */}
          <div className="flex items-center justify-between gap-3 pt-1 pb-2">
            {[
              { num: 1, label: "Product" },
              { num: 2, label: "Audience" },
              { num: 3, label: "Launch" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1 last:flex-none gap-2.5">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step >= s.num ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-xs font-bold ${
                    step >= s.num ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
                {idx < 2 && (
                  <div
                    className={`h-[2px] flex-1 mx-2 ${
                      step > s.num ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1: PRODUCT */}
          {step === 1 && (
            <div className="space-y-6 pt-2">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                  What's your product called? <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. The Content Creator's Toolkit"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                  What type of product is this? <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {PRODUCT_TYPES.map((pt) => {
                    const Icon = pt.icon;
                    const active = productType === pt.id;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setProductType(pt.id)}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition ${
                          active
                            ? "border-emerald-600 bg-emerald-50/60 text-emerald-950 ring-1 ring-emerald-600"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? "text-emerald-600" : "text-slate-500"}`} />
                        <span className="text-xs font-bold">{pt.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  This shapes your launch strategy and timeline.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                  What price range? <span className="text-rose-600">*</span>
                </label>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES[currency].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setPriceRange(pr)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold transition ${
                          priceRange === pr
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {pr}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-bold">
                    {(["NGN", "USD", "GBP", "EUR"] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => handleCurrencyChange(curr)}
                        className={`px-3 py-1 rounded-full transition ${
                          currency === curr ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                        }`}
                      >
                        {curr === "NGN" ? "₦ NGN" : curr === "USD" ? "$ USD" : curr === "GBP" ? "£ GBP" : "€ EUR"}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Higher prices need more trust-building in your plan.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                  What niche or topic is this for? <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. productivity for freelancers, fitness for busy mums"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Be specific — this tailors your messaging and content angles.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                  Where will people buy it?
                </label>
                <input
                  type="text"
                  value={buyLink}
                  onChange={(e) => setBuyLink(e.target.value)}
                  placeholder="e.g. selar.co/your-product or gumroad.com/l/your-product"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Your Selar, Gumroad, Whop, or Stan.store product link — we'll drop it straight into every email, DM, and caption. Leave blank if you haven't listed it yet.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!productName.trim() || !niche.trim()) {
                      setErrorMsg("Please enter both your Product Name and Niche to continue.");
                      return;
                    }
                    setErrorMsg(null);
                    setStep(2);
                  }}
                  className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 transition shadow-sm"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: AUDIENCE */}
          {step === 2 && (
            <div className="space-y-6 pt-2">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2.5">
                  How big is your audience right now? <span className="text-rose-600">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {AUDIENCE_TIERS.map((tier) => {
                    const active = audienceSize === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setAudienceSize(tier.id)}
                        className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-2 transition relative ${
                          active
                            ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                          <span>{tier.badge}</span> {tier.label}
                        </span>
                        {active && (
                          <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950">
                  {activeAudienceObj.tip}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2.5">
                  Where are you most active? <span className="text-rose-600">*</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {CHANNELS.map((ch) => {
                    const active = selectedChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold transition ${
                          active
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {ch}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Your launch tasks and scripts will be written specifically for these platforms.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2.5">
                  What's your content vibe? <span className="text-rose-600">*</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {CONTENT_VIBES.map((vb) => {
                    const active = contentVibe === vb;
                    return (
                      <button
                        key={vb}
                        type="button"
                        onClick={() => setContentVibe(vb)}
                        className={`px-4 py-2 rounded-full border text-xs font-bold transition ${
                          active
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {vb}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  We'll write your DM scripts, email subject lines, and post captions in this tone.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-7 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 transition shadow-sm"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LAUNCH */}
          {step === 3 && (
            <div className="space-y-6 pt-2">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                  When do you want to launch?
                </label>
                <input
                  type="date"
                  value={launchDate}
                  onChange={(e) => setLaunchDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Leave blank and we'll suggest the optimal sprint timeline.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2.5">
                  Check everything that's true right now
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FOUNDATION_CHECKS.map((item) => {
                    const checked = completedItems.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleFoundationCheck(item)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-2.5 text-xs font-semibold transition ${
                          checked
                            ? "border-emerald-600 bg-emerald-50/50 text-emerald-950"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${
                            checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"
                          }`}
                        >
                          {checked && <Check className="w-3 h-3" />}
                        </span>
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Readiness Score Card */}
                <div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full border-2 border-emerald-600 bg-white flex items-center justify-center font-black text-sm text-emerald-700 shrink-0">
                    {readinessScore}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-emerald-700">{readinessStage.label}</div>
                    <p className="text-xs text-slate-500">{readinessStage.desc}</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Your plan skips what you've already done.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2">
                  What problem does your product solve? <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                  placeholder="e.g. They spend hours creating content but get no engagement and make no money from it"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Be specific — this becomes your launch messaging.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="flex-1 ml-4 py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Building Custom Launch Playbook...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" /> Generate my launch plan · 15 credits
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 4: BEAUTIFUL DESIGNED ROADMAP OUTPUT & HTML/PDF EXPORT */}
      {step === 4 && generatedPlan && (
        <div className="space-y-6">
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" /> {generatedPlan.optimalTimelineLabel}
                  </span>
                  {wallet.planTier === "free" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                      <Clock className="w-3 h-3" /> Saved for 7 days (Free Tier)
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">{productName}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {generatedPlan.strategySummary}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAndPrintPdf}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview / Save PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDesignedHtml}
                  className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download Designed HTML
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                Channels: <strong className="text-slate-800">{selectedChannels.join(", ")}</strong> · Tone:{" "}
                <strong className="text-slate-800">{contentVibe}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-bold text-purple-700 hover:underline"
              >
                + Plan Another Launch
              </button>
            </div>
          </div>

          {/* Day-by-Day Interactive Cards */}
          <div className="space-y-4">
            {(generatedPlan.days || []).map((day: any, idx: number) => (
              <div
                key={day.dayNumber}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-xl bg-emerald-600 text-white font-mono font-extrabold text-xs flex items-center justify-center">
                      D{day.dayNumber}
                    </span>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {day.phase} · {day.channel}
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900">{day.title}</h3>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {(day.actionChecklist || []).map((task: string, tIdx: number) => (
                    <div
                      key={tIdx}
                      className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/70"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>

                {/* Copyable Daily Script */}
                <div className="rounded-2xl bg-purple-50/50 border border-purple-200/80 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-950">
                      Script: {day.copyScriptTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(day.copyScriptBody);
                        setCopiedDayIdx(idx);
                        setTimeout(() => setCopiedDayIdx(null), 2000);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-[11px] font-bold text-purple-800 inline-flex items-center gap-1 hover:bg-purple-50"
                    >
                      {copiedDayIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy Script
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-xl border border-purple-100">
                    {day.copyScriptBody}
                  </pre>
                </div>
              </div>
            ))}
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

export default function LaunchAdvisorPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading Launch Advisor...</div>}>
      <LaunchAdvisorContent />
    </Suspense>
  );
}