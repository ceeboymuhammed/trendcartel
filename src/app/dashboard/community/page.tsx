"use client";

import Link from "next/link";
import { MessageSquare, Lock, Heart, MessageCircle, Sparkles, ShieldAlert } from "lucide-react";

export default function CommunityPage() {
  const visibleMessages = [
    {
      author: "Tobi Adeyemi",
      badge: "Creator Pro",
      avatar: "T",
      time: "2 hours ago",
      content: "Just made my first 3 sales on Selar for my Notion budget planner! ₦15,000 made today. The email sequence from Tool #4 did all the heavy lifting.",
      likes: 14,
      replies: 5,
    },
    {
      author: "Claire Bennett",
      badge: "Global Seller",
      avatar: "C",
      time: "5 hours ago",
      content: "Launched my Etsy printable pack using the Tier-1 angle. Two sales from the US at $24 each. Highly recommend following the Day 4 launch checklist.",
      likes: 22,
      replies: 8,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Creator Community</h1>
            <p className="text-slate-500 text-xs">
              Connect with fellow creators validating in Nigeria and scaling across Tier-1 markets.
            </p>
          </div>
        </div>
      </div>

      {/* Free Tier Notice */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-sky-900 font-medium">
          <span className="h-2 w-2 rounded-full bg-sky-500" />
          Free Tier Preview: Showing 2 recent updates
        </div>
        <Link href="/dashboard/settings?tab=subscription" className="text-xs font-bold text-sky-700 hover:text-sky-800 underline">
          Unlock All Posts
        </Link>
      </div>

      {/* Visible Posts (Free Tier: Exactly 2 messages) */}
      <div className="space-y-4">
        {visibleMessages.map((msg, i) => (
          <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                  {msg.avatar}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{msg.author}</div>
                  <div className="text-[10px] text-slate-400">{msg.time}</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                {msg.badge}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{msg.content}</p>

            <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-slate-400 text-xs">
              <span className="flex items-center gap-1 hover:text-rose-500 cursor-pointer">
                <Heart className="w-3.5 h-3.5" /> {msg.likes}
              </span>
              <span className="flex items-center gap-1 hover:text-sky-500 cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" /> {msg.replies} replies
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Locked / Blurred Feed Overlay */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-8 overflow-hidden text-center shadow-sm">
        <div className="filter blur-sm select-none opacity-40 space-y-4">
          <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-slate-200 rounded w-5/6 mx-auto" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex flex-col items-center justify-center p-6">
          <div className="h-12 w-12 rounded-2xl bg-purple-100 text-[#6D28D9] flex items-center justify-center mb-3 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Unlock the Full Creator Community</h2>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Get instant access to live offer feedback, collaboration channels, and weekly sales teardowns.
          </p>
          <Link
            href="/dashboard/settings?tab=subscription"
            className="px-6 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Full Access
          </Link>
        </div>
      </div>
    </div>
  );
}