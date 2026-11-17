// src/app/api/launch-advisor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateWithDualLLM } from "@/lib/ai/llmRouter";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";
import { verifyAndDeductCredits } from "@/lib/billing/enforceCredits";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productName,
      productType,
      priceRange,
      currency = "NGN",
      niche,
      buyLink = "",
      audienceSize = "Under 500 followers",
      channels = ["WhatsApp Status", "Twitter / X"],
      contentVibe = "Bold & Direct",
      launchDate = "",
      completedItems = [],
      problemSolved = "",
    } = body;

    if (!productName || !niche) {
      return NextResponse.json({ error: "Product name and niche are required." }, { status: 400 });
    }

    const totalDays = audienceSize === "Under 500 followers" ? 10 : 14;
    const linkText = buyLink.trim() ? buyLink.trim() : "[INSERT YOUR SELAR / GUMROAD LINK]";

    const systemPrompt = `You are a sharp digital product launch strategist for African and global creators.
Build a personalized, day-by-day ${totalDays}-day launch roadmap for "${productName}" (${productType}) in the "${niche}" niche.
CRITICAL RULES:
- Skip tasks the creator has ALREADY completed: ${completedItems.length > 0 ? completedItems.join(", ") : "None yet (start from foundation)"}.
- Audience strategy: ${
      audienceSize === "Under 500 followers"
        ? "Focus on borrowed audiences, direct outreach DMs, WhatsApp Status storytelling, and helpful replies in Nairaland/Reddit/X threads."
        : "Focus on warm-up waitlist teasers, segmented email sequences, and high-urgency launch week offers."
    }
- Tone for all scripts: ${contentVibe}.
- Embed this exact checkout link in scripts: ${linkText}
- Return pure valid JSON with NO markdown symbols matching:
{
  "strategySummary": string (3 crisp sentences explaining the core launch angle and why it converts at ${priceRange} ${currency}),
  "optimalTimelineLabel": string (e.g. "${totalDays}-Day Sprint"),
  "days": [
    {
      "dayNumber": number (1 to ${totalDays}),
      "phase": "Foundation & Tease" | "Social Proof & Waitlist" | "Cart Open (Launch)" | "Objection Handling & Close",
      "title": string,
      "channel": string (one of ${channels.join(", ")}),
      "actionChecklist": string[] (3 concrete daily tasks),
      "copyScriptTitle": string (e.g. "WhatsApp Status 3-Slide Hook" or "X/Twitter Problem-Solution Thread"),
      "copyScriptBody": string (complete, ready-to-paste DM, post caption, or email script)
    }
  ]
}`;

    const userPrompt = `Product Name: "${productName}"
Product Type: ${productType}
Price Range: ${priceRange} (${currency})
Niche/Topic: ${niche}
Checkout URL: ${buyLink || "Not created yet — include storefront setup on Day 1"}
Audience Size: ${audienceSize}
Active Channels: ${channels.join(", ")}
Content Vibe: ${contentVibe}
Target Launch Date: ${launchDate || "Optimal immediate sprint"}
Already Completed: ${completedItems.join(", ") || "Nothing yet"}
Core Problem Solved: ${problemSolved}`;

const creditCost = TOOL_CREDIT_COSTS.launch_advisor; // 15 credits
const userId = body.userId;

if (userId && userId !== "guest-trial-user") {
  const authCheck = await verifyAndDeductCredits({
    userId,
    toolKey: "launch_advisor",
    creditCost,
  });

  if (!authCheck.allowed) {
    return NextResponse.json(
      { error: authCheck.error, code: authCheck.code },
      { status: authCheck.status }
    );
  }
}

    const rawJson = await generateWithDualLLM({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.65,
    });

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      return NextResponse.json({ success: true, plan: parsed });
    }

    return NextResponse.json({ error: "Could not generate launch plan. Check GEMINI_API_KEY." }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Launch plan generation failed." }, { status: 500 });
  }
}