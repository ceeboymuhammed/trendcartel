"use client";

import { HelpCircle, Mail, MessageSquare, ExternalLink, ArrowRight } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Help & Support</h1>
          <p className="text-slate-500 text-xs">Have questions or need assistance? We are here to help.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
          <Mail className="w-5 h-5 text-purple-600" />
          <h2 className="font-bold text-slate-900 text-sm">Direct Email Support</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Need account assistance or custom integration help? Drop our engineering team a direct note.
          </p>
          <a
            href="mailto:support@trendcartel.com"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline pt-2"
          >
            support@trendcartel.com <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-900 text-sm">Community Q&A</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Search questions answered by other creators who have launched and sold in your exact niche.
          </p>
          <a
            href="/dashboard/community"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:underline pt-2"
          >
            Go to Community <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Frequently Asked Questions</h3>
        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-900 block mb-1">How does the 60-day first-sale guarantee work?</span>
            Follow the 14-day launch playbook. If you don't make a sale within 60 days, request a full refund through settings.
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="font-bold text-slate-900 block mb-1">Can I accept Naira and foreign currencies simultaneously?</span>
            Yes, use Selar for local Nigerian bank transfers and Gumroad or Lemon Squeezy for USD, GBP, and EUR payments.
          </div>
        </div>
      </div>
    </div>
  );
}