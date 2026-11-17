"use client";

import Link from "next/link";
import { Search, Sparkles, FileText, Mail, Zap, Rocket, ArrowRight } from "lucide-react";

export default function DashboardOverviewPage() {
  const tools = [
    { href: "/dashboard/discovery", title: "Keyword Research", desc: "Scan live buyer demand across 11+ platforms.", icon: Search, color: "text-amber-500 bg-amber-500/10" },
    { href: "/dashboard/monetisation", title: "Monetisation AI", desc: "Generate complete ebooks, Notion packs, and planners.", icon: Sparkles, color: "text-emerald-500 bg-emerald-500/10" },
    { href: "/dashboard/nexis", title: "Nexis AI", desc: "Write viral scripts and organic content hooks.", icon: Zap, color: "text-purple-500 bg-purple-500/10" },
    { href: "/dashboard/sales-page", title: "Sales Page Builder", desc: "Dual sales copy for Selar (₦) and Gumroad ($).", icon: FileText, color: "text-pink-500 bg-pink-500/10" },
    { href: "/dashboard/email-builder", title: "Email List Builder", desc: "Generate your lead magnet and 7-day conversion funnel.", icon: Mail, color: "text-blue-500 bg-blue-500/10" },
    { href: "/dashboard/launch-advisor", title: "Launch Advisor", desc: "Follow your day-by-day 14-day launch roadmap.", icon: Rocket, color: "text-rose-500 bg-rose-500/10" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome to TrendCartel</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Everything you need to turn a raw topic into a profitable digital product.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tools.map((t, i) => {
          const Icon = t.icon;
          return (
            <Link
              key={i}
              href={t.href}
              className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${t.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-900 text-base">{t.title}</h2>
                <p className="text-slate-500 text-xs leading-relaxed">{t.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition">
                <span>Open tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}