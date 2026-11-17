export interface PlanTier {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  searchesPerMonth: number | 'unlimited';
  scope: 'nigeria_digital' | 'global_all';
  badge?: string;
  features: string[];
}

export const SUBSCRIPTION_TIERS: PlanTier[] = [
  {
    id: 'tier_free',
    name: 'Free Forever',
    description: 'Test the waters and validate your first digital product idea in Nigeria.',
    priceUSD: 0,
    searchesPerMonth: 3,
    scope: 'nigeria_digital',
    features: [
      '3 Lifetime Searches',
      'Nigerian Digital Products (Selar)',
      'Long-tail Niche Breakdown',
      'Basic Offer Structuring'
    ]
  },
  {
    id: 'tier_ng_pro',
    name: 'Naija Digital Pro',
    description: 'Scale info-products, templates, and digital playbooks for the Nigerian audience.',
    priceUSD: 9,
    searchesPerMonth: 'unlimited',
    scope: 'nigeria_digital',
    badge: 'Popular in NG',
    features: [
      'Unlimited Searches for Nigeria',
      'Monthly Search Volume & Velocity',
      'Selar/Mainstack Verified Competitors',
      '1-Click Lean Digital Product Builder',
      'WhatsApp Direct-Response Scripts'
    ]
  },
  {
    id: 'tier_global_pro',
    name: 'Global + NG All-Access',
    description: 'Dominate both the Nigerian market and international high-ticket USD buyers.',
    priceUSD: 29,
    searchesPerMonth: 'unlimited',
    scope: 'global_all',
    badge: 'Maximum Profit',
    features: [
      'Everything in Naija Digital Pro',
      'Global Digital Markets (Gumroad, Etsy, Whop)',
      'Negative Review Gap Miner',
      'High-Ticket Offer & Bundle Architect',
      'Complete Launch Marketing Suite (Meta/X/Email)'
    ]
  }
];