"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Sparkles,
  Zap,
  FileText,
  Mail,
  Rocket,
  BookOpen,
  Compass,
  Trophy,
  Users,
  HelpCircle,
  Settings,
  Coins,
  Clock,
  Menu,
  X,
} from "lucide-react";
import UpgradePlanModal from "@/components/UpgradePlanModal";
import { PlanTier } from "@/lib/billing/plans";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Prototype defaults (replace with live Supabase wallet hook once Auth is wired)
  const [planTier] = useState<PlanTier>("free");
  const [credits] = useState<number>(25);
  const [userEmail] = useState<string>("");

  const navTools = [
    {
      href: "/dashboard/discovery",
      label: "Discovery Engine",
      cost: "5 cr",
      icon: Search,
      color: "text-sky-400",
    },
    {
      href: "/dashboard/monetisation",
      label: "Monetisation AI",
      cost: "3–30 cr",
      icon: Sparkles,
      color: "text-emerald-400",
    },
    {
      href: "/dashboard/nexis",
      label: "Cartel Studio",
      cost: "5 cr",
      icon: Zap,
      color: "text-purple-400",
    },
    {
      href: "/dashboard/sales-page",
      label: "Sales Page Builder",
      cost: "5 cr",
      icon: FileText,
      color: "text-amber-400",
    },
    {
      href: "/dashboard/email-builder",
      label: "Email & WA Funnel",
      cost: "15 cr",
      icon: Mail,
      color: "text-pink-400",
    },
    {
      href: "/dashboard/launch-advisor",
      label: "Launch Advisor",
      cost: "15 cr",
      icon: Rocket,
      color: "text-emerald-400",
    },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between bg-slate-950 text-slate-200 w-64 p-4 border-r border-slate-800/80">
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link href="/dashboard/discovery" className="flex items-center gap-2.5 px-2 pt-1">
          <div className="h-9 w-9 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center font-black text-base shadow-sm">
            TC
          </div>
          <div>
            <span className="font-black text-white tracking-tight text-base block leading-none">
              TrendCartel
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              Naija + Tier-1 Creator OS
            </span>
          </div>
        </Link>

        {/* AI TOOLS SECTION */}
        <div>
          <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">
            AI Creation Engines
          </div>
          <nav className="space-y-1">
            {navTools.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    active
                      ? "bg-[#6D28D9] text-white shadow-xs"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? "text-white" : item.color}`} />
                    <span>{item.label}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      active ? "bg-white/20 text-white" : "bg-slate-900 text-slate-400"
                    }`}
                  >
                    {item.cost}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LEARNING SECTION — COMING SOON */}
        <div>
          <div className="px-3 flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">
            <span>Learning Academy</span>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[9px] font-extrabold">
              Coming Soon
            </span>
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/learning"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-900/70 transition"
            >
              <span className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Your First Sale</span>
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-amber-400/90 border border-slate-800">
                Soon
              </span>
            </Link>

            <Link
              href="/dashboard/learning"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-900/70 transition"
            >
              <span className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 text-slate-500" />
                <span>Beyond First Sale</span>
              </span>
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-900 text-amber-400/90 border border-slate-800">
                Soon
              </span>
            </Link>
          </div>
        </div>

        {/* COMMUNITY & SUPPORT */}
        <div>
          <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-2">
            Workspace
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/analytics"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === "/dashboard/analytics"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Leaderboard & Proof</span>
            </Link>
            <Link
              href="/dashboard/community"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === "/dashboard/community"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Creator Community</span>
            </Link>
            <Link
              href="/dashboard/support"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === "/dashboard/support"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>Help & Support</span>
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                pathname === "/dashboard/settings"
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Wallet & WhatsApp Subscribe Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase">
            {planTier === "free" ? "Free Trial" : `${planTier} Plan`}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-400">
            <Coins className="w-3.5 h-3.5" /> {credits} cr
          </span>
        </div>

        {planTier === "free" && (
          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3 h-3 text-amber-400 shrink-0" />
            <span>1 tool max · 7-day task retention</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowUpgradeModal(true)}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-xs"
        >
          Subscribe / Add Credits
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0">
        <div className="sticky top-0 h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 h-full overflow-y-auto">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="lg:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-slate-900 text-slate-200"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-black text-sm tracking-tight">TrendCartel</span>
          <button
            type="button"
            onClick={() => setShowUpgradeModal(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
          >
            ⚡ {credits} cr · Upgrade
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>

      {/* WhatsApp Subscription Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={planTier}
        currentCredits={credits}
        userEmail={userEmail}
      />
    </div>
  );
}