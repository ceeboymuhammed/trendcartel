import { NextRequest, NextResponse } from "next/server";
import { generateWithDualLLM } from "@/lib/ai/llmRouter";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";
import { verifyAndDeductCredits } from "@/lib/billing/enforceCredits";

function cleanFormatting(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      type, // "free" | "paid"
      productName,
      productType,
      topic,
      buyerPain,
      tone = "Relatable Naija Street-Smart",
      onCamera,
      buyLink,
      platform,
      adSpend,
      currency,
      payoutDestination,
      userId,
    } = body;

    if (!productName || !topic || !buyerPain) {
      return NextResponse.json(
        { error: "Product name, topic, and buyer problem are required." },
        { status: 400 }
      );
    }

    // 1. Enforce 5 credits & Free-Tier 1-tool limit inside POST
    const creditCost = TOOL_CREDIT_COSTS.studio; // 5 credits
    if (userId && userId !== "guest-trial-user") {
      const authCheck = await verifyAndDeductCredits({
        userId,
        toolKey: "studio",
        creditCost,
      });

      if (!authCheck.allowed) {
        return NextResponse.json(
          { error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "free") {
      systemPrompt = `You are an elite social media copywriter and short-form content strategist for creators selling digital products in Nigeria (via Selar & WhatsApp) and globally (via Gumroad & Etsy).
CRITICAL FORMATTING RULE: Never use markdown hashtags (#, ##, ###) or double asterisks (**). Use clean ALL-CAPS section headers, bullet points, and clear spacing.
Tone requested: ${tone}.
- If tone is "Relatable Naija Street-Smart": Use natural, everyday Nigerian context (sharp, relatable, addressing money/time waste without fake caricatures).
- If tone is "Corporate / Professional": Use crisp, authoritative executive language suited for LinkedIn and B2B buyers.
- If tone is "Global Tier-1 Creator": Use punchy, direct-response creator hooks suited for US/UK/European audiences.

Tailor the output structure strictly to the selected platform:
- If platform is "WhatsApp Status / Broadcast": Output 5 sequential WhatsApp Status text slides (Slide 1 Hook -> Slide 2 Problem -> Slide 3 Agitation -> Slide 4 Proof/Solution -> Slide 5 Direct Link CTA) plus 1 Broadcast DM follow-up message.
- If platform is "Twitter / X Thread": Output a 6-tweet high-retention thread (Tweet 1 Hook -> Tweets 2-5 Value Breakdown -> Tweet 6 CTA with link).
- If platform is "LinkedIn Post": Output a structured, high-authority LinkedIn post with a strong opening line, scannable takeaways, and soft CTA.
- Otherwise (TikTok / Instagram Reels / YouTube Shorts): Output a timed video script with [HOOK 0:00-0:03], [THE MISTAKE 0:03-0:15], [THE SYSTEM 0:15-0:35], and [CALL TO ACTION 0:35-0:45], including exact spoken words and on-screen text cues.`;

      userPrompt = `Write a complete, ready-to-post piece of text content:
- Product Name: ${productName}
- Format: ${productType || "Digital Toolkit / Template"}
- Core Topic: ${topic}
- Platform: ${platform || "WhatsApp Status / Broadcast"}
- Target Buyer & Pain Point: ${buyerPain}
- Visual Approach: ${
        onCamera === "yes"
          ? "Creator on camera / personal face-to-camera delivery"
          : "Faceless / text-only / screen & hands demonstration"
      }
- Storefront Link: ${buyLink || "Link in bio / DM me 'READY'"}`;
    } else {
      systemPrompt = `You are a direct-response Meta (Facebook & Instagram) Paid Ads specialist.
CRITICAL FORMATTING RULE: Never use markdown hashtags (#, ##, ###) or double asterisks (**). Use clean ALL-CAPS headers and structured bullet points.
Tone requested: ${tone}.

Output a complete text ad launch blueprint with:
1. TARGETING & AUDIENCE SETUP (Locations, age bracket, and exact interest layers)
2. PRIMARY AD COPY (3 variations: Short Punchy Hook, Story/Pain-Point Angle, and Direct Offer)
3. HEADLINE & LINK DESCRIPTION (Ready to paste into Meta Ads Manager)
4. CREATIVE & VISUAL DIRECTION (Text overlays and shot list based on camera preference)
5. BUDGET & KILL/SCALE RULES (Exact daily spend guidance for ${currency} ${adSpend}/day)`;

      userPrompt = `Create a complete Paid Ad text package:
- Product Name: ${productName}
- Product Format: ${productType || "Digital Product"}
- Payment Destination: ${payoutDestination || "Selar (Naira Bank Transfer & Cards)"}
- Topic: ${topic}
- Exact Buyer & Pain Point: ${buyerPain}
- Camera Preference: ${onCamera === "yes" ? "On camera" : "Faceless / screen & text only"}
- Daily Budget: ${currency} ${adSpend}/day
- Destination URL: ${buyLink || "https://selar.com/m/your-product"}`;
    }

    const rawOutput = await generateWithDualLLM({
      systemPrompt,
      userPrompt,
      jsonMode: false,
      temperature: 0.7,
    });

    if (!rawOutput) {
      return NextResponse.json(
        {
          error:
            "Unable to generate content right now. Please verify your GEMINI_API_KEY in .env.local and restart the server.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      script: cleanFormatting(rawOutput),
      creditsDeducted: creditCost,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate content." },
      { status: 500 }
    );
  }
}