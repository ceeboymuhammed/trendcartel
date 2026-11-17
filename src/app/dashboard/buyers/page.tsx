"use client";

import { useState } from "react";
import { Users, Search, Mail, ExternalLink, Sparkles, Send, ShieldCheck, Lock } from "lucide-react";

export default function BuyersPage() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("all");
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState<any[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;

    setLoading(true);
    // Simulating buyer profile search matching user niche
    setTimeout(() => {
      setBuyers([
        {
          name: "Chidi Okafor",
          role: "Solo Freelance UI Designer",
          location: "Lagos, Nigeria",
          platform: "Twitter / X",
          handle: "@chidi_ui",
          verifiedPain: "Looking for client onboarding invoice templates that accept USD without chargebacks.",
          email: "chidi.o***@gmail.com",
          status: "High Match",
        },
        {
          name: "Sarah Jenkins",
          role: "Independent Notion Consultant",
          location: "London, UK",
          platform: "Reddit (r/Notion)",
          handle: "u/sarah_builds",
          verifiedPain: "Needs an aesthetic food prep and grocery inventory database.",
          email: "sarah***@notionhub.co",
          status: "High Match",
        },
        {
          name: "Tunde Bakare",
          role: "Digital Nomad & Remote Engineer",
          location: "Abuja, Nigeria",
          platform: "Nairaland / LinkedIn",
          handle: "linkedin.com/in/tbakare",
          verifiedPain: "Asking questions about DIY UK transit documents and flight routing.",
          email: "tunde***@techpulse.ng",
          status: "Verified",
        },
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Buyer Profile Finder</h1>
            <p className="text-slate-500 text-sm">
              Discover people actively asking for solutions in your niche and reach out with cold DMs.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold">
          Starter Tool
        </span>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Audience / Problem Keyword
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. freelance proposal templates, Nigerian grocery meal prep, remote tech jobs"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-250 text-slate-800 text-xs focus:outline-none focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Platform Source
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-250 bg-white text-slate-800 text-xs focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Sources (X, Reddit, Nairaland)</option>
              <option value="nigeria">Nigeria Only (Nairaland, X NG)</option>
              <option value="tier1">Tier-1 Global Only (Reddit, X US/UK)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2"
        >
          <Search className="w-3.5 h-3.5" />
          {loading ? "Searching profiles..." : "Find Potential Buyers"}
        </button>
      </form>

      {/* Buyer Profiles Result List */}
      {buyers.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verified Potential Buyers Found ({buyers.length})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {buyers.map((b, i) => (
              <div key={i} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm">{b.name}</h2>
                      <div className="text-[11px] text-slate-500">{b.role}</div>
                      <div className="text-[10px] text-teal-600 font-mono mt-0.5">{b.location}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {b.status}
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Trigger Pain: </span>
                    “{b.verifiedPain}”
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Contact:</span>
                    <span className="font-mono text-slate-700">{b.email}</span>
                  </div>
                  <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-1.5">
                    <Send className="w-3 h-3 text-teal-400" />
                    Copy Outreach Script
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}