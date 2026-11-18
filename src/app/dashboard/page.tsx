"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  FileText,
  Mail,
  Zap,
  Rocket,
  ArrowRight,
  Coins,
  Clock,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import UpgradePlanModal from "@/components/UpgradePlanModal";

export default function DashboardOverviewPage() {
  const { wallet } = useWallet();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const tools = [
    {
      href: "/dashboard/discovery",
      title: "Discovery Engine",
      cost: "5 credits",
      desc: "Scan live buyer demand, X/Nairaland threads, and Selar/Gumroad pricing.",
      icon: Search,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      href: "/dashboard/monetisation",
      title: "Monetisation AI",
      cost: "3–30 credits",
      desc: "Generate complete ebooks, Notion packs, and print-ready A4 planners.",
      icon: Sparkles,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      href: "/dashboard/nexis",
      title: "Cartel Studio",
      cost: "5 credits",
      desc: "Write WhatsApp Status slides, viral threads, Reels scripts & Meta ads.",
      icon: Zap,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      href: "/dashboard/sales-page",
      title: "Sales Page Builder",
      cost: "5 credits",
      desc: "Dual high-converting sales copy for Selar (₦) and Gumroad ($).",
      icon: FileText,
      color: "text-pink-500 bg-pink-500/10",
    },
    {
      href: "/dashboard/email-builder",
      title: "Email & WA Funnel",
      cost: "15 credits",
      desc: "Generate your lead magnet hook, 5-day email sequence & WhatsApp closes.",
      icon: Mail,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      href: "/dashboard/launch-advisor",
      title: "Launch Advisor",
      cost: "15 credits",
      desc: "Follow your personalized 7-day or 14-day launch roadmap & daily scripts.",
      icon: Rocket,
      color: "text-rose-500 bg-rose-500/10",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header + Wallet Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome to TrendCartel
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Validate demand in Naira (₦) &amp; USD ($), build finished digital assets, and launch fast.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950 text-xs font-bold">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>{wallet.credits} Credits Available</span>
          </div>

          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Subscribe via WhatsApp
          </button>
        </div>
      </div>

      {/* Free Tier Rules Notice */}
      {wallet.planTier === "free" && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-start sm:items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Free Starter Trial:</strong> You can complete <strong>1 tool workflow</strong> with your 25 credits and retain your completed task details for <strong>7 days</strong>.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="font-extrabold text-purple-800 hover:underline shrink-0 text-left"
          >
            Unlock All Tools (100–500 cr) →
          </button>
        </div>
      )}

      {/* 6 AI Creation Engines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map((t, i) => {
          const Icon = t.icon;
          return (
            <Link
              key={i}
              href={t.href}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${t.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    ⚡ {t.cost}
                  </span>
                </div>
                <h2 className="font-extrabold text-slate-900 text-base">{t.title}</h2>
                <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600 group-hover:text-[#6D28D9] transition">
                <span>Open tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Learning Academy Coming Soon Strip */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm">Learning Academy: Your First Sale &amp; Beyond</h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Step-by-step video lessons on validating in Naira on Selar and scaling to USD on Gumroad &amp; Etsy.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/learning"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 shrink-0 self-start sm:self-auto"
        >
          View Preview
        </Link>
      </div>

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={wallet.planTier}
        currentCredits={wallet.credits}
        userEmail={wallet.email}
        lockReason="MANUAL_UPGRADE"
      />
    </div>
  );
}