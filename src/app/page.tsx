
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight,
  Check,
  Zap,
  Sparkles,
  Search,
  Mail,
  Rocket,
  MessageCircle,
  Clock,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import {
  SUBSCRIPTION_PLANS,
  getWhatsAppSubscribeUrl,
} from "@/lib/billing/plans";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Validate Real Buyer Demand First",
    desc: "Scan live chatter on Nairaland, X (Twitter), Reddit, Selar, Gumroad, and Etsy so you never waste weeks building a product nobody wants.",
    badge: "Discovery Engine · 5 cr",
    icon: Search,
  },
  {
    step: "02",
    title: "Generate Your Finished Digital Asset",
    desc: "Turn any validated topic into a print-ready A4 Template Pack, Challenge Kit, Notion System, or Full Ebook—complete with 3 cover variations and storefront copy.",
    badge: "Monetisation AI · 12–30 cr",
    icon: Sparkles,
  },
  {
    step: "03",
    title: "Launch in Naira (₦) & Scale to USD ($)",
    desc: "Get a 5-day email funnel, WhatsApp Status & broadcast scripts, Meta ad copy, and a day-by-day launch roadmap engineered to hit your first sales fast.",
    badge: "Studio, Funnel & Advisor",
    icon: Rocket,
  },
];

const SUITE_TOOLS = [
  {
    name: "Naija + Tier-1 Discovery Engine",
    tagline: "Spot proven buyer pain points before you write a word.",
    desc: "Pulls real search volume, competition levels, forum threads, and active competitor pricing across Selar, Gumroad, and Etsy.",
    icon: Search,
    color: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  },
  {
    name: "Monetisation AI Product Studio",
    tagline: "From blank page to print-ready A4 PDF & ZIP package.",
    desc: "Generates structured multi-page planners, trackers, workbooks, Notion architectures, 3 cover designs, READMEs, and ready-to-paste listing copy.",
    icon: Layers,
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  },
  {
    name: "Cartel Studio (Viral Copy & Ads)",
    tagline: "Relatable Naija Street-Smart or Global Tier-1 hooks.",
    desc: "Writes WhatsApp Status slide sequences, X/Twitter threads, Reels scripts, and Meta Ads Manager blueprints calibrated to Naira or USD daily budgets.",
    icon: Zap,
    color: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  },
  {
    name: "Email & WhatsApp Funnel Builder",
    tagline: "Turn cold profile visitors into paying customers.",
    desc: "Creates an opt-in lead magnet hook, a 5-day automated email conversion sequence, and 3 WhatsApp broadcast closing messages.",
    icon: Mail,
    color: "bg-pink-500/15 text-pink-400 border-pink-500/20",
  },
  {
    name: "Naija-to-Global Launch Advisor",
    tagline: "Your personalized 7-day or 14-day execution playbook.",
    desc: "Scores your launch readiness, skips steps you have already done, and outputs daily action checklists with copy-paste scripts.",
    icon: Rocket,
    color: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  },
  {
    name: "Creator Academy (Coming Soon)",
    tagline: "Step-by-step video playbooks for Your First Sale & Beyond.",
    desc: "Guided modules showing how to validate locally on Selar in Naira and scale internationally on Gumroad & Etsy.",
    icon: BookOpen,
    color: "bg-neutral-800 text-neutral-400 border-neutral-700",
    comingSoon: true,
  },
];

const FAQS = [
  {
    q: "Do I need a large social media following to make sales?",
    a: "No. TrendCartel is built specifically for creators starting from zero. You can list your finished PDFs and templates where buyers are already searching (Selar, Gumroad, Etsy) and use our WhatsApp Status & X scripts to convert warm contacts first.",
  },
  {
    q: "How does the Free Starter trial work?",
    a: "You get 25 starter credits at $0 / ₦0—enough to complete 1 full tool workflow (for example, validating a niche or building a complete Template Pack + pricing strategy) and keep your completed project files for 7 days.",
  },
  {
    q: "How do I subscribe to the Creator (100 credits) or Pro (500 credits) plan?",
    a: "Click Subscribe on your preferred plan below. It opens a direct WhatsApp message to our activation desk (+234 802 652 1855) with your plan details pre-filled so your monthly credits and unlimited history are activated within minutes.",
  },
  {
    q: "Can I sell my generated products on Selar, Gumroad, and Etsy?",
    a: "Yes. Every product built in Monetisation AI comes with dual Naira (₦) and USD ($) pricing benchmarks, print-ready A4 pages, 3 cover variations, and storefront listing copy tailored for Selar, Gumroad, and Etsy.",
  },
];

export default function LandingPage() {
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setIsLoggedIn(Boolean(user));
      setUserEmail(user?.email || "");
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsLoggedIn(Boolean(session?.user));
      setUserEmail(session?.user?.email || "");
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleWhatsAppPlanClick = (planId: "starter" | "pro") => {
    const plan = SUBSCRIPTION_PLANS[planId];
    const priceLabel = currency === "NGN" ? plan.priceNGN : plan.priceUSD;
    const url = getWhatsAppSubscribeUrl({
      planName: plan.name,
      credits: plan.credits,
      priceLabel,
      userEmail,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      id="top"
      className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-emerald-500 selection:text-neutral-950"
    >
      {/* Top Announcement Bar */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 px-4 text-center text-[11px] font-semibold text-emerald-300">
        Start free with 25 credits · Build 1 complete tool workflow · Validate in ₦ Naira &amp; Scale in $ USD
      </div>

      {/* Sticky Navigation */}
      <header className="border-b border-neutral-800/90 bg-neutral-950/85 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="#top" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-neutral-950 text-lg">
              T
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">
              Trend<span className="text-emerald-400">Cartel</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-400">
            <a href="#how-it-works" className="hover:text-white transition">
              How it works
            </a>
            <a href="#tools" className="hover:text-white transition">
              AI Engines
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-sm inline-flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login?mode=signin&redirect=%2Fdashboard"
                  className="text-xs font-semibold text-neutral-300 hover:text-white transition px-2.5 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup&redirect=%2Fdashboard"
                  className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                >
                  Start Here
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold mb-6">
          <Zap className="w-3.5 h-3.5" /> Built for African &amp; Global Digital Creators
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
          Your First Digital Product, <br className="hidden sm:inline" />
          <span className="text-emerald-400">Validated &amp; Ready to Sell.</span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-9 leading-relaxed">
          AI uncovers what buyers are actively searching for on Nairaland, X, Selar, and Gumroad—then builds your complete ebook, planner, or Notion system, plus the WhatsApp scripts, emails, and launch plan to sell it. No audience needed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black px-8 py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login?mode=signup&redirect=%2Fdashboard"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black px-8 py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                Start Here (25 Credits Included) <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login?mode=signin&redirect=%2Fdashboard"
                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold px-7 py-4 rounded-2xl text-sm transition flex items-center justify-center gap-2"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium">
          <span>✓ ₦0 / $0 to start</span>
          <span>✓ Complete 1 full tool workflow free</span>
          <span>✓ Export print-ready A4 PDFs &amp; ZIP packs</span>
        </div>

        {/* Product Pipeline Preview Strip */}
        <div className="mt-14 bg-neutral-900/70 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl">
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-neutral-800 pb-5 md:pb-0 md:pr-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
              Step 1 · Market Proof
            </span>
            <h3 className="font-bold text-white text-sm">
              “Everyone says sell a digital product, but you’re stuck at a blank doc.”
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Stop guessing. See live buyer complaints, monthly search demand, and exact Naira &amp; USD price points before building.
            </p>
          </div>

          <div className="space-y-2 border-b md:border-b-0 md:border-r border-neutral-800 pb-5 md:pb-0 md:pr-5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Step 2 · Instant Packaging
            </span>
            <h3 className="font-bold text-white text-sm">
              Complete A4 PDFs, 3 Covers &amp; Store Copy in Minutes
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Download a ready-to-upload ZIP bundle formatted for Selar (Naira bank transfers) and Gumroad/Etsy (global USD).
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Step 3 · The 3-Sale Math
            </span>
            <h3 className="font-bold text-white text-sm">
              Sell 3 Copies at ₦5,000 and the Tool Pays for Itself
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Use our WhatsApp Status slides, 5-day email sequence, and 14-day launch checklist to land your first buyers fast.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-900"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            How TrendCartel Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            From Raw Idea to Live Buyable Link in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-7 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                      STEP {item.step}
                    </span>
                    <Icon className="w-5 h-5 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400">
                  {item.badge}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The 5 Live Engines + Learning Coming Soon */}
      <section
        id="tools"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-900"
      >
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            All-In-One Creator Stack
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Everything You Need to Research, Build &amp; Launch
          </h2>
          <p className="text-sm text-neutral-400 mt-3">
            One unified credit wallet powers every engine inside your workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUITE_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.name}
                className="bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 rounded-3xl p-6 space-y-4 transition relative"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${tool.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {tool.comingSoon && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase">
                      Coming Soon
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-white">{tool.name}</h3>
                  <p className="text-xs font-semibold text-emerald-400 mt-1">{tool.tagline}</p>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">{tool.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing & Live WhatsApp Subscription Section */}
      <section
        id="pricing"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-900"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
            Simple Wallet Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
            Start Free. Upgrade via WhatsApp Anytime.
          </h2>
          <p className="text-sm text-neutral-400 mt-3">
            Test 1 full tool workflow free with 25 credits, or subscribe to unlock all engines and permanent project storage.
          </p>

          {/* Currency Switcher */}
          <div className="mt-6 inline-flex items-center bg-neutral-900 p-1 rounded-full border border-neutral-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCurrency("NGN")}
              className={`px-4 py-1.5 rounded-full transition ${
                currency === "NGN"
                  ? "bg-emerald-500 text-neutral-950"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              ₦ Naira (Nigeria)
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`px-4 py-1.5 rounded-full transition ${
                currency === "USD"
                  ? "bg-emerald-500 text-neutral-950"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              $ USD (Global)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
          {/* FREE STARTER (25 CREDITS) */}
          <div className="rounded-3xl p-7 border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">
                  {SUBSCRIPTION_PLANS.free.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-bold">
                  Free Trial
                </span>
              </div>

              <div>
                <div className="text-4xl font-black text-white">
                  {currency === "NGN" ? "₦0" : "$0"}
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  ⚡ 25 one-time starter credits
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Use 1 tool once · Completed details kept for 7 days</span>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-neutral-300">
                {SUBSCRIPTION_PLANS.free.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-xs uppercase tracking-wider text-center block transition"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login?mode=signup&redirect=%2Fdashboard"
                className="w-full py-3.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-extrabold text-xs uppercase tracking-wider text-center block transition"
              >
                Start Here (25 Credits)
              </Link>
            )}
          </div>

          {/* CREATOR PLAN (100 CREDITS) */}
          <div className="rounded-3xl p-7 border-2 border-emerald-500 bg-neutral-900 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-emerald-950/40">
            <span className="absolute -top-3.5 left-6 px-3.5 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-neutral-950 uppercase tracking-wider">
              Most Popular
            </span>

            <div className="space-y-4">
              <div className="flex items-center justify-between pt-1">
                <h3 className="text-lg font-extrabold text-white">
                  {SUBSCRIPTION_PLANS.starter.name}
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-400">100 cr/mo</span>
              </div>

              <div>
                <div className="text-4xl font-black text-white">
                  {currency === "NGN"
                    ? SUBSCRIPTION_PLANS.starter.priceNGN
                    : SUBSCRIPTION_PLANS.starter.priceUSD}
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-1">
                  ⚡ 100 Monthly Wallet Credits
                </div>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-neutral-200">
                {SUBSCRIPTION_PLANS.starter.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleWhatsAppPlanClick("starter")}
              className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
            >
              <MessageCircle className="w-4 h-4" /> Subscribe via WhatsApp
            </button>
          </div>

          {/* AGENCY / PRO PLAN (500 CREDITS) */}
          <div className="rounded-3xl p-7 border border-neutral-800 bg-neutral-900/50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">
                  {SUBSCRIPTION_PLANS.pro.name}
                </h3>
                <span className="text-xs font-mono font-bold text-amber-400">500 cr/mo</span>
              </div>

              <div>
                <div className="text-4xl font-black text-white">
                  {currency === "NGN"
                    ? SUBSCRIPTION_PLANS.pro.priceNGN
                    : SUBSCRIPTION_PLANS.pro.priceUSD}
                </div>
                <div className="text-xs font-bold text-amber-400 mt-1">
                  ⚡ 500 Monthly Wallet Credits
                </div>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-neutral-300">
                {SUBSCRIPTION_PLANS.pro.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleWhatsAppPlanClick("pro")}
              className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" /> Subscribe via WhatsApp
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Subscriptions are verified directly via WhatsApp (+234 802 652 1855) with instant wallet top-up upon confirmation.
          </span>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="max-w-3xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-900 space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left text-sm font-bold text-white hover:bg-neutral-900 transition"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/70 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950/90 via-neutral-900 to-purple-950/70 border border-emerald-500/30 p-8 sm:p-12 text-center space-y-5">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Stop Sitting on Ideas. Launch Your First Asset Today.
          </h2>
          <p className="text-sm text-neutral-300 max-w-xl mx-auto">
            Claim your 25 free starter credits, validate a hungry niche, and download your finished product package in minutes.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm transition shadow-lg"
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login?mode=signup&redirect=%2Fdashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-sm transition shadow-lg"
                >
                  Start Here <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login?mode=signin&redirect=%2Fdashboard"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-sm transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-10 px-4 sm:px-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-neutral-950 text-xs">
              T
            </div>
            <span className="font-bold text-neutral-300">TrendCartel</span>
            <span>· Launch a digital product. No audience needed.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-white transition">
              How it works
            </a>
            <a href="#pricing" className="hover:text-white transition">
              Pricing
            </a>
            <a
              href={getWhatsAppSubscribeUrl({
                planName: "Creator Plan",
                credits: 100,
                priceLabel: SUBSCRIPTION_PLANS.starter.priceNGN,
                userEmail,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition"
            >
              WhatsApp Support (+234 802 652 1855)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}