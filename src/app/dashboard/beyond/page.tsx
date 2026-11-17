"use client";

import Link from "next/link";
import { Compass, Lock, Play, ArrowRight, CheckCircle2 } from "lucide-react";

export default function BeyondFirstSalePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Beyond First Sale</h1>
            <p className="text-slate-500 text-xs">
              Forty-one lessons. One sale to a catalogue that keeps selling: search, short videos, a list you own, a price ladder, live events and your own shop.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Module Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Your progress</span>
              <span>0 / 41</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-0" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              PHASE 1: Free traffic
            </div>

            <div className="space-y-1">
              {[
                { num: "1", title: "Your next products", count: "0/7 lessons", active: true },
                { num: "2", title: "Get found via search SEO", count: "0/4 lessons", active: false },
                { num: "3", title: "Short videos that compound", count: "0/7 lessons", active: false },
                { num: "4", title: "Your email list engine", count: "0/2 lessons", active: false },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs flex items-center justify-between transition ${
                    m.active ? "bg-amber-50/60 border border-amber-200 font-semibold text-amber-900" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px]">
                      {m.num}
                    </span>
                    <span>{m.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{m.count}</span>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
              PHASE 2: Scaling & operations
            </div>

            <div className="space-y-1">
              {[
                { num: "5", title: "Other people, ads & affiliates", count: "0/5 lessons" },
                { num: "6", title: "Price ladder & upsells", count: "0/4 lessons" },
                { num: "7", title: "High-ticket coaching offers", count: "0/3 lessons" },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-xl text-xs flex items-center justify-between text-slate-500 hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                      {m.num}
                    </span>
                    <span>{m.title}</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold text-amber-700 font-mono">LESSON 1.1</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              Find an idea people already pay for
            </h2>
            <span className="text-xs text-slate-400">⏱ 7:10 min video</span>
          </div>

          <div className="aspect-video w-full rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white relative">
            <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur flex items-center justify-center border border-white/20">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
            <span className="mt-3 text-xs text-slate-400">Advanced Masterclass</span>
          </div>

          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <h3 className="font-bold text-slate-900 text-sm">By the end of this lesson</h3>
            <p>
              You're going to have your next 5 products written down, in order, all for the buyer you already have. And it takes about 20 minutes.
            </p>
            <h3 className="font-bold text-slate-900 text-sm pt-2">A real example</h3>
            <p>
              A creator started in April 2023 with one product: a book tracker for $15. It sold over 5,000 copies. Then they made more for the same person: a habit tracker, a money tracker, and a bundle for $39. That bundle alone has sold over 2,000 copies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}