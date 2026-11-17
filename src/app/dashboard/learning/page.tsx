"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, ArrowRight, Clock, MessageCircle } from "lucide-react";
import UpgradePlanModal from "@/components/UpgradePlanModal";

export default function LearningComingSoonPage() {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
        <Clock className="w-3.5 h-3.5 text-amber-700" /> Learning Academy · Coming Soon
      </div>

      <div className="h-16 w-16 rounded-3xl bg-purple-100 text-[#6D28D9] flex items-center justify-center mx-auto">
        <BookOpen className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          The Naira-to-Dollar Creator Academy is Almost Ready
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          We are finalizing our step-by-step video modules for <strong>Your First Sale</strong> (20 lessons) and <strong>Beyond First Sale</strong> (41 lessons) tailored for Selar, Gumroad, and WhatsApp funnels.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 shadow-sm">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Track 1 · Coming Soon
          </span>
          <h3 className="font-extrabold text-slate-900 text-sm">Your First Sale</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            From zero audience to your first live buyable link on Selar & Gumroad using free traffic.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Track 2 · Coming Soon
          </span>
          <h3 className="font-extrabold text-slate-900 text-sm">Beyond First Sale</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Scaling from ₦50k–₦100k local validation into a multi-product USD digital asset catalogue.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          href="/dashboard/discovery"
          className="px-6 py-3 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-sm"
        >
          <Sparkles className="w-4 h-4" /> Use Live AI Tools Now <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          type="button"
          onClick={() => setShowUpgradeModal(true)}
          className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2 transition shadow-sm"
        >
          <MessageCircle className="w-4 h-4" /> Subscribe via WhatsApp
        </button>
      </div>

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}