import { NextRequest, NextResponse } from "next/server";
import { generateWithDualLLM } from "@/lib/ai/llmRouter";

// Strip any accidental markdown # symbols so text renders cleanly everywhere
function cleanMarkdownHashes(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      displayName = "Creator",
      productTitle,
      niche,
      subFormat = "Digital Planner",
      pages = [],
      writingVoice = "Direct, practical & encouraging",
    } = body;

    if (!productTitle || !pages.length) {
      return NextResponse.json({ error: "Product title and page structure are required." }, { status: 400 });
    }

    const isNotion = subFormat.toLowerCase().includes("notion");

    const systemPrompt = isNotion
      ? `You are a Notion Systems Engineer building "${productTitle}" for ${displayName} in the "${niche}" niche.
Tone: ${writingVoice}.
CRITICAL FORMATTING RULE: Do NOT use markdown hashtags (#, ##, ###) or double asterisks (**). Use clean plain text with ALL-CAPS section titles, pipe-separated property tables, and clear bullet points.
For each Notion module/page provided, write:
1. DATABASE & VIEW SETUP (Exact database name, view type: Table/Board/Calendar, and filter rules)
2. PROPERTIES & FORMULAS (Exact column names, property types like Select, Date, Formula, Relation, and options)
3. EMBEDDED SOP & CHECKLIST (Ready-to-paste page content inside the Notion template)

Return pure JSON matching:
{
  "summaryText": string,
  "pagesContent": [
    {
      "pageNumber": number,
      "title": string,
      "bodyText": string
    }
  ]
}`
      : `You are a master digital product author writing "${productTitle}" (${subFormat}) by ${displayName} in the "${niche}" niche.
Tone: ${writingVoice}.
CRITICAL FORMATTING RULE: Do NOT use markdown hashtags (#, ##, ###) or double asterisks (**). Use clean plain text with ALL-CAPS section headers, numbered action steps, fill-in-the-blank prompts, and bullet lists.
Write complete, deeply practical, domain-specific content for each of the ${pages.length} pages. No generic placeholders.

Return pure JSON matching:
{
  "summaryText": string,
  "pagesContent": [
    {
      "pageNumber": number,
      "title": string,
      "bodyText": string
    }
  ]
}`;

    const pageListString = pages
      .map((p: any) => `Section ${p.pageNumber}: ${p.title} — ${p.description}`)
      .join("\n");

    const rawJson = await generateWithDualLLM({
      systemPrompt,
      userPrompt: `Write the complete, ready-to-sell content for every section below:\n${pageListString}`,
      jsonMode: true,
      temperature: 0.6,
    });

    if (rawJson) {
      const parsed = JSON.parse(rawJson);
      const formattedPages = (parsed.pagesContent || []).map((p: any) => {
        const cleanedBody = cleanMarkdownHashes(p.bodyText || "");
        const words = cleanedBody.split(/\s+/).filter(Boolean).length;
        return {
          pageNumber: p.pageNumber,
          title: p.title,
          bodyText: cleanedBody,
          wordCount: words,
        };
      });

      const totalWords = formattedPages.reduce((acc: number, p: any) => acc + p.wordCount, 0);

      return NextResponse.json({
        success: true,
        summaryText:
          parsed.summaryText ||
          `Your ${subFormat} is ${formattedPages.length} focused master sections in total—minimalist, zero-fluff, and ready to sell on Selar (₦) and Gumroad ($).`,
        totalWords,
        pagesContent: formattedPages,
      });
    }

    return NextResponse.json({ error: "Failed to generate content from AI." }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate content." }, { status: 500 });
  }
}