"use client";

import { useState } from "react";
import { 
  Settings, 
  Store, 
  Link as LinkIcon, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Zap, 
  HelpCircle,
  ExternalLink,
  MessageCircle,
  Sparkles,
  Trophy
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"storefronts" | "distribution" | "subscription">("storefronts");
  const [saved, setSaved] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Store links (NO banking credentials needed)
    selarLink: "https://selar.com/m/adeyemi-digital",
    mainstackLink: "",
    gumroadLink: "https://tobiade.gumroad.com",
    etsyShopLink: "",
    whopLink: "",
    // Distribution Channels
    whatsappAudienceSize: "300 - 500 contacts",
    twitterHandle: "@tobi_growth",
    instagramHandle: "@tobicreates",
    preferredNiche: "Food & Budget Living",
    currentLocation: "Lagos, Nigeria",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Creator Settings & Proof Links</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Connect your live store links to verify your sales, track progress, and climb the Leaderboard.
            </p>
          </div>
        </div>

        {/* Reassurance Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          No Bank or Card Details Needed
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("storefronts")}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === "storefronts" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Store className="w-4 h-4" />
          Storefronts & Live Links (Proof)
          {activeTab === "storefronts" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("distribution")}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === "distribution" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Audience & Channels
          {activeTab === "distribution" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("subscription")}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === "subscription" ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Subscription (Naira & USD)
          {activeTab === "subscription" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
          )}
        </button>
      </div>

      {/* TAB 1: STOREFRONTS & PROOF LINKS */}
      {activeTab === "storefronts" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Your Live Product Links</h2>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Provide the public links where your products are listed. We check these links to count your public product count and qualify your spot on the Leaderboard.
              </p>
            </div>

            {/* Nigeria Storefront (Phase 1) */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Phase 1: Local Nigerian Channels (₦)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selar Store / Profile Link
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.selarLink}
                      onChange={(e) => setFormData({ ...formData, selarLink: e.target.value })}
                      placeholder="https://selar.com/m/yourname"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Primary route for Naira bank transfer and USSD checkout.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mainstack / Other Local Store (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={formData.mainstackLink}
                      onChange={(e) => setFormData({ ...formData, mainstackLink: e.target.value })}
                      placeholder="https://mainstack.store/yourname"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Global Storefront (Phase 2) */}
            <div className="space-y-4 pt-2">
              <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Phase 2: Global Tier-1 Channels ($ / £ / €)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gumroad Profile</label>
                  <input
                    type="url"
                    value={formData.gumroadLink}
                    onChange={(e) => setFormData({ ...formData, gumroadLink: e.target.value })}
                    placeholder="https://yourname.gumroad.com"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Etsy Shop Link</label>
                  <input
                    type="url"
                    value={formData.etsyShopLink}
                    onChange={(e) => setFormData({ ...formData, etsyShopLink: e.target.value })}
                    placeholder="https://etsy.com/shop/yourname"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Whop Store URL</label>
                  <input
                    type="url"
                    value={formData.whopLink}
                    onChange={(e) => setFormData({ ...formData, whopLink: e.target.value })}
                    placeholder="https://whop.com/yourhub"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Promise Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-900">Privacy & Safety: </span>
                We only scan public prices, reviews, and product titles to track aggregate marketplace proof. We will never ask for your banking passwords, login tokens, or sensitive payout credentials.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-2"
              >
                Save My Proof Links
              </button>

              {saved && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Links successfully updated!
                </span>
              )}
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: AUDIENCE & CHANNELS */}
      {activeTab === "distribution" && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Your Distribution Footprint</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tells our Content Engine (Nexis AI) how to calibrate your scripts for where you actually reach people.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Status Audience Size
              </label>
              <select
                value={formData.whatsappAudienceSize}
                onChange={(e) => setFormData({ ...formData, whatsappAudienceSize: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-250 bg-white text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="Under 100 views">Under 100 views (Starter)</option>
                <option value="100 - 300 views">100 - 300 views</option>
                <option value="300 - 500 contacts">300 - 500 views (Active)</option>
                <option value="500 - 1,000+ views">500 - 1,000+ views (Super-connector)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Nigerian Base Location
              </label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                placeholder="e.g. Lagos, Abuja, Port Harcourt, Ibadan"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Twitter / X Profile (@handle)
              </label>
              <input
                type="text"
                value={formData.twitterHandle}
                onChange={(e) => setFormData({ ...formData, twitterHandle: e.target.value })}
                placeholder="@yourhandle"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Instagram / TikTok Handle
              </label>
              <input
                type="text"
                value={formData.instagramHandle}
                onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                placeholder="@yourhandle"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-250 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              Update Distribution Channels
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SUBSCRIPTION & BILLING (NAIRA FIRST) */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          {/* Active Trial Notice */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Active Plan</span>
              <div className="text-xl font-black text-slate-900 mt-0.5">7-Day Free Trial</div>
              <div className="text-xs text-slate-500 mt-1">
                Full access to all 6 tools. Backed by our 60-day first-sale guarantee[cite: 19].
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold shadow-sm shrink-0">
              7 Days Remaining
            </div>
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pay in Naira Card */}
            <div className="bg-white border-2 border-emerald-500/80 rounded-3xl p-6 shadow-sm space-y-4 relative">
              <div className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Recommended for Nigeria
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">Creator Plan (Naira)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Automated debit via Paystack. Supports Nigerian bank cards & transfers.</p>
              </div>

              <div className="text-3xl font-black text-slate-900">
                ₦15,000 <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Unlimited Keyword Research searches across 11+ channels
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Full access to Monetisation AI, PDF & Notion Exporters[cite: 19]
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dual Sales Copy Generator for Selar (₦) and Gumroad ($)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Leaderboard proof badges & rank verification
                </li>
              </ul>

              <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm">
                Subscribe in Naira (₦15,000)
              </button>
            </div>

            {/* Pay in USD Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Global Tier-1 Plan</h3>
                <p className="text-xs text-slate-500 mt-0.5">Billed via Stripe or Lemon Squeezy in USD.</p>
              </div>

              <div className="text-3xl font-black text-slate-900">
                $24 <span className="text-xs font-normal text-slate-500">/ month</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  All Creator Plan features included
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  US/UK virtual account friendly billing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  International merchant compliance assistance
                </li>
              </ul>

              <button className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-sm">
                Subscribe in USD ($24)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}