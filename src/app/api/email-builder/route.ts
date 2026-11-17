import { NextRequest, NextResponse } from "next/server";
import { generateWithDualLLM } from "@/lib/ai/llmRouter";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";
import { verifyAndDeductCredits } from "@/lib/billing/enforceCredits";

function cleanText(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productTitle,
      niche = "Digital Products",
      format = "Digital Toolkit",
      pricePoint = "₦6,500 / $19",
      targetAudience = "Beginners & busy professionals",
      leadMagnetHook = "Free 1-Page Quick-Start Checklist",
      tone = "Relatable Naija Street-Smart",
      checkoutLink = "https://selar.com/m/your-product",
      userId,
    } = body;

    if (!productTitle || !productTitle.trim()) {
      return NextResponse.json(
        { error: "Please select an existing product or enter a product name." },
        { status: 400 }
      );
    }

    // 1. Enforce 15 credits & Free-Tier 1-tool limit
    const creditCost = TOOL_CREDIT_COSTS.email_builder; // 15 credits
    if (userId && userId !== "guest-trial-user") {
      const authCheck = await verifyAndDeductCredits({
        userId,
        toolKey: "email_builder",
        creditCost,
      });

      if (!authCheck.allowed) {
        return NextResponse.json(
          { error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }
    }

    const systemPrompt = `You are a Direct-Response Email & WhatsApp Funnel Architect specializing in digital product launches in Nigeria (Selar, Paystack, WhatsApp) and Tier-1 global markets (Gumroad, ConvertKit).
CRITICAL FORMATTING RULE: Never use markdown hashtags (#, ##, ###) or double asterisks (**). Use clean plain text with ALL-CAPS section headers and clear spacing.
Tone requested: ${tone}.

Return pure valid JSON with NO markdown wrapping matching this exact schema:
{
  "optInHeadline": string (high-converting landing page headline for the free lead magnet),
  "optInSubheadline": string (2-sentence value proposition),
  "leadMagnetDeliverable": string (exact outline of the 1-page freebie they get upon signing up),
  "emails": [
    {
      "day": number (1 to 5),
      "timing": string (e.g. "Immediate (0 mins)", "Day 2 — 9:00 AM"),
      "angle": string (e.g. "Lead Magnet Delivery + Quick Win", "The Costly Mistake", "Case Study & Proof", "FAQ & Objection Crusher", "24-Hour Urgency Close"),
      "subjectLine": string,
      "previewText": string,
      "body": string (complete, ready-to-paste email copy with natural CTA to ${checkoutLink})
    }
  ],
  "whatsappFollowUps": [
    {
      "stage": string (e.g. "Broadcast 1: Free Value Drop", "Broadcast 2: Proof & Reminder", "Broadcast 3: Final Closing Nudge"),
      "message": string (short, punchy WhatsApp message ready to copy-paste)
    }
  ]
}`;

    const userPrompt = `Build a complete 5-day Email List & WhatsApp Conversion Funnel:
- Paid Product Being Sold: "${productTitle}" (${format})
- Niche / Topic: ${niche}
- Price Point: ${pricePoint}
- Target Buyer: ${targetAudience}
- Free Lead Magnet Offer: ${leadMagnetHook}
- Checkout Link: ${checkoutLink}
- Tone: ${tone}

Write all 5 complete emails and 3 WhatsApp follow-up messages.`;

    const rawJson = await generateWithDualLLM({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.65,
    });

    if (!rawJson) {
      return NextResponse.json(
        {
          error:
            "Unable to generate email funnel right now. Please check your GEMINI_API_KEY in .env.local.",
        },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawJson);

    const cleanedEmails = (parsed.emails || []).map((em: any) => ({
      ...em,
      body: cleanText(em.body || ""),
    }));

    const cleanedWhatsapp = (parsed.whatsappFollowUps || []).map((wa: any) => ({
      ...wa,
      message: cleanText(wa.message || ""),
    }));

    return NextResponse.json({
      success: true,
      creditsDeducted: creditCost,
      funnel: {
        ...parsed,
        emails: cleanedEmails,
        whatsappFollowUps: cleanedWhatsapp,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate email funnel." },
      { status: 500 }
    );
  }
}