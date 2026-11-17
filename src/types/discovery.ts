export interface CompetitorProduct {
  title: string;
  price: string;
  platform: 'Selar' | 'Jiji' | 'Gumroad' | 'Etsy' | 'Whop';
  salesVolume?: string;
  url?: string;
}

export interface MarketIntelligence {
  competitorProducts: CompetitorProduct[];
  rawForumQuestions: string[];
  winningAngle: string;
}

export interface DiscoveryResponse {
  topic: string;
  demandScore: number;
  nigeria: MarketIntelligence;
  tier1: MarketIntelligence;
}