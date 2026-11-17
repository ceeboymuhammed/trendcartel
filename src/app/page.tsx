'use client';

import Link from 'next/link';
import { SUBSCRIPTION_TIERS } from '@/config/tiers';
import { ArrowRight, CheckCircle2, Zap, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 selection:bg-emerald-500 selection:text-neutral-950">
      {/* Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-neutral-950 text-xl">
              T
            </div>
            <span className="font-bold text-lg text-white">Trend<span className="text-emerald-400">Cartel</span></span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-neutral-300 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
          <Zap className="w-3.5 h-3.5" /> For Digital Product Creators & Arbitrageurs
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6">
          Turn Generic Ideas into <br />
          <span className="text-emerald-400">High-Ticket Digital Products</span> That Sell.
        </h1>
        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Never guess again. Transform broad concepts into high-urgency, long-tail niches with real monthly search volume, verified buyer complaints, and ready-to-sell launch assets.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold px-8 py-3.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            Start with 3 Free Searches <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Pricing / Tiers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-800">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            Transparent Pricing in USD ($)
          </h2>
          <p className="text-sm text-neutral-400">
            Start completely free. Upgrade when you need unlimited volume metrics and global digital access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl p-6 border flex flex-col justify-between transition relative ${
                tier.id === 'tier_ng_pro'
                  ? 'border-emerald-500 bg-neutral-900 shadow-2xl shadow-emerald-950/40 ring-1 ring-emerald-500'
                  : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-neutral-950 uppercase tracking-wide">
                  {tier.badge}
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-xs text-neutral-400 mb-6 min-h-[32px]">{tier.description}</p>

                <div className="mb-6 pb-6 border-b border-neutral-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      ${tier.priceUSD}
                    </span>
                    <span className="text-neutral-400 text-xs font-medium">/ month</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Included Features:
                  </div>
                  {tier.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/login"
                className={`w-full py-3 rounded-xl font-bold text-xs transition text-center uppercase tracking-wider block ${
                  tier.id === 'tier_ng_pro'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                }`}
              >
                {tier.priceUSD === 0 ? 'Sign Up Free' : `Get Started ($${tier.priceUSD})`}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}