// src/lib/billing/plans.ts

export type PlanTier = "free" | "starter" | "pro";

export type ToolKey =
  | "discovery"
  | "monetisation"
  | "studio"
  | "email_builder"
  | "launch_advisor";

export const WHATSAPP_SUBSCRIPTION_NUMBER = "2348026521855";

export const TOOL_CREDIT_COSTS = {
  discovery: 5,
  monetisation_ideas: 3,
  monetisation_template: 12,
  monetisation_challenge: 20,
  monetisation_ebook: 30,
  monetisation_pricing: 5,
  studio: 5,
  email_builder: 15,
  launch_advisor: 15,
} as const;

export const SUBSCRIPTION_PLANS = {
  free: {
    id: "free" as PlanTier,
    name: "Free Starter",
    credits: 25,
    priceNGN: "₦0",
    priceUSD: "$0",
    retentionDays: 7,
    features: [
      "25 one-time starter credits",
      "Complete 1 tool workflow",
      "7-day saved project retention",
      "Naira (Selar) & USD (Gumroad) benchmarks",
    ],
  },
  starter: {
    id: "starter" as PlanTier,
    name: "Creator Plan",
    credits: 100,
    priceNGN: "₦15,000 / mo",
    priceUSD: "$9 / mo",
    retentionDays: null, // Unlimited retention
    features: [
      "100 monthly wallet credits",
      "Full access to all 5 AI engines",
      "Unlimited permanent project storage",
      "Full Ebook, Funnel & Launch Roadmap exports",
    ],
  },
  pro: {
    id: "pro" as PlanTier,
    name: "Agency / Pro Plan",
    credits: 500,
    priceNGN: "₦38,000 / mo",
    priceUSD: "$29 / mo",
    retentionDays: null, // Unlimited retention
    features: [
      "500 monthly wallet credits",
      "Unlimited multi-product builds & funnels",
      "Permanent cloud archive & ZIP exports",
      "Priority WhatsApp creator support",
    ],
  },
};

export function getWhatsAppSubscribeUrl(params: {
  planName: string;
  credits: number;
  priceLabel: string;
  userEmail?: string;
}): string {
  const { planName, credits, priceLabel, userEmail } = params;
  const text = [
    `Hello TrendCartel! I want to subscribe to the *${planName}* (${credits} Credits — ${priceLabel}).`,
    ``,
    `Account Email: ${userEmail?.trim() || "[Enter my registered email]"}`,
    ``,
    `Please send payment details so my credits can be activated.`,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_SUBSCRIPTION_NUMBER}?text=${encodeURIComponent(text)}`;
}