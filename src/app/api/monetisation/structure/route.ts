import { NextRequest, NextResponse } from "next/server";
import { generateWithDualLLM } from "@/lib/ai/llmRouter";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";
import { verifyAndDeductCredits } from "@/lib/billing/enforceCredits";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      displayName = "Creator",
      productTitle,
      niche,
      format,
      subFormat,
      singlePageIndex,
      existingPages = [],
      userId,
    } = body;

    if (!productTitle) {
      return NextResponse.json({ error: "Product title is required." }, { status: 400 });
    }

    const activeType = subFormat || format;
    const isNotion = activeType.toLowerCase().includes("notion");
    const targetPageCount = format === "Full Ebook" ? 8 : 5;

    // Regenerate single card (free edit after initial product commitment)
    if (typeof singlePageIndex === "number" && existingPages[singlePageIndex]) {
      const targetPage = existingPages[singlePageIndex];
      const rawSingle = await generateWithDualLLM({
        systemPrompt: `You are a digital product architect. Rewrite one section of a ${activeType} titled "${productTitle}" in the "${niche}" niche. Return pure JSON: { "title": string, "description": string }`,
        userPrompt: `Replace "${targetPage.title}" (${targetPage.description}) with a sharper, domain-specific ${
          isNotion ? "Notion database/view" : "actionable worksheet"
        } for "${niche}".`,
        jsonMode: true,
        temperature: 0.75,
      });

      if (rawSingle) {
        return NextResponse.json({ success: true, page: JSON.parse(rawSingle) });
      }
    }

    // Determine exact credit cost by chosen format (12, 20, or 30 credits)
    const creditCost =
      format === "Full Ebook"
        ? TOOL_CREDIT_COSTS.monetisation_ebook // 30 credits (Paid plans only)
        : format === "Challenge Kit"
        ? TOOL_CREDIT_COSTS.monetisation_challenge // 20 credits
        : TOOL_CREDIT_COSTS.monetisation_template; // 12 credits

    if (userId && userId !== "guest-trial-user") {
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

    const systemPrompt = isNotion
      ? `You are a Notion Systems Architect. Design a ${targetPageCount}-module importable Notion Workspace structure for "${productTitle}" in the "${niche}" niche.
Each item must represent a real Notion Page, Linked Database, Rollup/Formula tracker, or SOP Hub—NOT a printable PDF page.
Return pure JSON matching:
{
  "pages": [
    {
      "pageNumber": number,
      "title": string,
      "description": string
    }
  ]
}`
      : `You are a Principal Product Architect. Design a minimalist ${targetPageCount}-page actionable document structure for "${productTitle}" (${activeType}) created by ${displayName} in the "${niche}" niche.
Keep it strictly ${targetPageCount} pages—zero fluff, pure execution checklists, calculators, and step-by-step frameworks.
Return pure JSON matching:
{
  "pages": [
    {
      "pageNumber": number,
      "title": string,
      "description": string
    }
  ]
}`;

    const rawJson = await generateWithDualLLM({
      systemPrompt,
      userPrompt: `Build a ${targetPageCount}-part structure for "${productTitle}" (${activeType}) tailored specifically to "${niche}".`,
      jsonMode: true,
      temperature: 0.55,
    });

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      return NextResponse.json({
        success: true,
        creditsDeducted: creditCost,
        pages: parsed.pages || [],
      });
    }

    return NextResponse.json({ error: "Failed to generate structure from AI." }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate structure." },
      { status: 500 }
    );
  }
}