import { NextRequest, NextResponse } from "next/server";
import { generateWithDualLLM } from "@/lib/ai/llmRouter";
import { verifyAndDeductCredits } from "@/lib/billing/enforceCredits";

async function fetchLiveNicheContext(topic: string) {
  const serperKey = (process.env.SERPER_API_KEY || "").replace(/^["']|["']$/g, "").trim();
  if (!serperKey) return { discussions: [], existingProducts: [] };

  try {
    console.log(`[Ideas API] Fetching live Serper context for "${topic}"...`);
    const [forumRes, marketRes] = await Promise.all([
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          q: `(site:nairaland.com OR site:x.com OR site:reddit.com) "${topic}" problems OR how to`,
          num: 6,
        }),
        signal: AbortSignal.timeout(5000),
      }),
      fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: { "X-API-KEY": serperKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          q: `(site:selar.com OR site:gumroad.com OR site:etsy.com) "${topic}"`,
          num: 6,
        }),
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    const forumJson = forumRes.ok ? await forumRes.json() : {};
    const marketJson = marketRes.ok ? await marketRes.json() : {};

    return {
      discussions: (forumJson.organic || []).map((i: any) => `${i.title}: ${i.snippet}`),
      existingProducts: (marketJson.organic || []).map((i: any) => `${i.title} (${i.link})`),
    };
  } catch (err) {
    console.warn("[Ideas API] Serper timed out or skipped, continuing to Gemini...");
    return { discussions: [], existingProducts: [] };
  }
}

function safeParseJson(raw: string) {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      niche = "Digital Business",
      targetAudience = "Busy professionals & beginners",
      platform = "WhatsApp & Instagram",
      skillLevel = "Beginner",
      country = "Nigeria",
      goal = "Make my first sales",
      hasAudience = "no",
      ideaExpertise = "",
      painPoints = "",
      userId,
    } = body;

    // 1. Idea generation is free (0 credits); credits are only deducted when building a format
    const creditCost = 0;
    if (userId && userId !== "guest-trial-user" && creditCost > 0) {
      const authCheck = await verifyAndDeductCredits({
        userId,
        toolKey: "monetisation",
        creditCost,
      });

      if (!authCheck.allowed) {
        return NextResponse.json(
          { error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }
    }

    const liveContext = await fetchLiveNicheContext(niche);

    const audienceStrategy =
      hasAudience === "yes"
        ? `USER HAS AN EXISTING AUDIENCE: Focus on higher-value transformation kits, premium workshops, or comprehensive bundles ($27–$67 / ₦10,000–₦25,000) that leverage warm trust and direct conversion.`
        : `USER HAS NO AUDIENCE (COLD TRAFFIC): Focus on ultra-specific, impulse-buy "quick-win" templates, checklists, and cheat sheets ($9–$24 / ₦3,500–₦7,500) engineered to sell via marketplace search (Selar/Etsy) and viral short-form hooks without needing followers.`;

   const systemPrompt = `You are a digital product strategist. Using the live forum discussions and competitor listings provided, generate 3 genuinely distinct, hyper-specific digital product ideas. Keep every description and insight crisp (max 25 words per field) for fast execution.
${audienceStrategy}
Return pure valid JSON with NO markdown formatting matching:
{
  "aiAnalysis": {
    "niche": string,
    "targetAudience": string,
    "strengths": [string, string],
    "opportunities": [string, string]
  },
  "ideas": [
    {
      "id": string,
      "format": "Challenge Kit" | "Template Pack" | "eBook" | "Notion System",
      "title": string,
      "description": string,
      "score": number,
      "difficulty": "easy" | "medium" | "hard",
      "buildTime": string,
      "priceRangeUSD": string,
      "priceRangeNGN": string,
      "isBestFit": boolean,
      "whyThisOne": {
        "primaryPainPoint": string,
        "targetAudienceBehavior": string,
        "monetizationEdge": string
      }
    }
  ]
}`;

    const userPrompt = `Niche: "${niche}"
Target Audience: ${targetAudience}
Primary Platform: ${platform}
Skill Level: ${skillLevel}
Target Country: ${country}
Goal: ${goal}
Existing Audience: ${hasAudience}
Initial Expertise: ${ideaExpertise}
Pain Points: ${painPoints}

Live Forum Chatter:
${liveContext.discussions.join("\n") || "Analyze everyday buyer bottlenecks in this niche."}

Competing Products:
${liveContext.existingProducts.join("\n") || "Analyze standard gaps on Selar, Gumroad, and Etsy."}`;

    console.log(`[Ideas API] Sending prompt to LLM Router for "${niche}"...`);
    const rawJson = await generateWithDualLLM({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.7,
    });

    if (rawJson) {
      const parsed = safeParseJson(rawJson);
      return NextResponse.json({
        success: true,
        creditsDeducted: 0,
        data: parsed,
      });
    }

    return NextResponse.json(
      { error: "AI generation failed. Verify GEMINI_API_KEY in .env.local." },
      { status: 502 }
    );
  } catch (err: any) {
    console.error("[Ideas API Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate product ideas." },
      { status: 500 }
    );
  }
}