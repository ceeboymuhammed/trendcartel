"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Circle, Play, ArrowRight, Sparkles, ExternalLink } from "lucide-react";

export default function FirstSaleGuidePage() {
  const [activeLesson, setActiveLesson] = useState(1);
  const [completed, setCompleted] = useState<number[]>([]);

  const toggleComplete = (id: number) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Trial Banner */}
      <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-purple-900 font-medium">
          <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
          Your trial ends in 7 days
        </div>
        <Link href="/dashboard/settings?tab=subscription" className="px-4 py-1.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold transition">
          Upgrade Now
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-purple-100 text-[#6D28D9] flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your First Sale</h1>
            <p className="text-slate-500 text-xs">
              Twenty lessons. Idea to a live, buyable link — then your first buyers, on free traffic.
            </p>
          </div>
        </div>
      </div>

      {/* Up-sell Card to Beyond First Sale */}
      <Link
        href="/dashboard/beyond"
        className="block bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 hover:border-amber-300 transition group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Your Paid Course</div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition">
                Beyond First Sale
              </div>
              <div className="text-xs text-slate-500">
                Forty-one lessons. One sale to a catalogue that keeps selling: search, short videos, a list you own, a price ladder, live events, and your own shop.
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 transition" />
        </div>
      </Link>

      {/* Main Course Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Progress & Lesson Index */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Your progress</span>
              <span>{completed.length} / 20</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full transition-all duration-300"
                style={{ width: `${(completed.length / 20) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ACT 1: Get to your first sale
            </div>

            <div className="space-y-1">
              {[
                { id: 1, title: "Find an idea people already pay for", duration: "7:10" },
                { id: 2, title: "Test local vs global demand signals", duration: "5:45" },
                { id: 3, title: "Package & price for Selar (₦) and Gumroad ($)", duration: "8:20" },
                { id: 4, title: "Sell it with your first free post", duration: "6:15" },
              ].map((l) => (
                <div
                  key={l.id}
                  onClick={() => setActiveLesson(l.id)}
                  className={`p-3 rounded-xl cursor-pointer text-xs flex items-center justify-between transition ${
                    activeLesson === l.id
                      ? "bg-purple-50 text-purple-900 font-semibold border border-purple-200"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(l.id);
                      }}
                    >
                      {completed.includes(l.id) ? (
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                    <span>{l.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{l.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Lesson Viewport */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-150 pb-4">
            <div>
              <span className="text-[11px] font-bold text-purple-700 font-mono">LESSON 1.{activeLesson}</span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                Find an idea people already pay for
              </h2>
              <span className="text-xs text-slate-400">⏱ 7:10 min video</span>
            </div>
            <button
              onClick={() => toggleComplete(activeLesson)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition"
            >
              {completed.includes(activeLesson) ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Completed
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4 text-slate-400" /> Mark complete
                </>
              )}
            </button>
          </div>

          {/* Video Placeholder Container */}
          <div className="aspect-video w-full rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden group">
            <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur group-hover:scale-105 transition flex items-center justify-center border border-white/20 cursor-pointer">
              <Play className="w-6 h-6 text-white fill-white ml-0.5" />
            </div>
            <span className="mt-3 text-xs text-slate-400">Lesson Video · English (Captions available)</span>
          </div>

          {/* Action Box: "Do this now" */}
          <div className="bg-amber-50/70 border border-amber-250 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <CheckCircle className="w-4 h-4 text-amber-700" />
              Do this now
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Run Keyword Research once on a topic you know well. Write down the top 3 buyer complaints you see in the results before generating your product.
            </p>
            <Link
              href="/dashboard/discovery"
              className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
            >
              Open Keyword Research <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}