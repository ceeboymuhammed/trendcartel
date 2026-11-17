import { NextRequest, NextResponse } from "next/server";
import { generateWithDualLLM } from "@/lib/ai/llmRouter";

function stripMarkdownSyntax(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/^\s*[-*]\s+\[\s*\]\s*/gm, "☐ ")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { title, topic, format, country = "Nigeria", hasAudience = false } = await req.json();

    const isNotion = (format || "").toLowerCase().includes("notion");

    if (isNotion) {
      const systemPrompt = `You are a Notion Certified Solutions Architect. Build a complete, ready-to-duplicate Notion Workspace System (NOT a prose ebook).
Do NOT include markdown hashtags (#) or asterisks (**) in any text field.
Return strict JSON:
{
  "productType": "notion_system",
  "workspaceTitle": string,
  "setupOverview": string,
  "pagesAndDatabases": [
    {
      "pageName": string,
      "purpose": string,
      "databaseProperties": string[],
      "sampleEntries": string[],
      "viewTypes": string[]
    }
  ],
  "copyPasteTemplates": [
    { "templateName": string, "content": string }
  ]
}`;

      const rawNotion = await generateWithDualLLM({
        systemPrompt,
        userPrompt: `Build a Notion Workspace System titled "${title}" for the niche "${topic}" targeting ${country}.`,
        jsonMode: true,
        temperature: 0.6,
      });

      if (!rawNotion) {
        return NextResponse.json({ error: "Notion system generation failed." }, { status: 502 });
      }

      return NextResponse.json({ success: true, data: JSON.parse(rawNotion) });
    }

    const systemPrompt = `You are an expert digital product creator. Create a focused, high-value 5-page actionable guide and execution toolkit (around 350–450 words per page, ~2,000 words total).
CRITICAL RULES:
- Do NOT write generic filler or introductory fluff.
- Do NOT use any Markdown characters (#, ##, **, * [ ]) anywhere in the JSON strings. Write clean, plain prose and clean list items.
- Every page must contain concrete steps, real numbers/examples, or actionable worksheets tailored specifically to "${topic}".

Return strict JSON:
{
  "productType": "action_document",
  "documentTitle": string,
  "subtitle": string,
  "totalPages": 5,
  "pages": [
    {
      "pageNumber": number,
      "pageTitle": string,
      "coreTakeaway": string,
      "bodyParagraphs": string[],
      "actionSteps": string[],
      "fieldNote": string
    }
  ]
}`;

    const rawDoc = await generateWithDualLLM({
      systemPrompt,
      userPrompt: `Create a 5-page practical action document titled "${title}" solving "${topic}" for buyers in ${country} (${hasAudience ? "warm audience" : "cold marketplace buyers"}).`,
      jsonMode: true,
      temperature: 0.65,
    });

    if (!rawDoc) {
      return NextResponse.json({ error: "Document generation failed." }, { status: 502 });
    }

    const docData = JSON.parse(rawDoc);

    if (Array.isArray(docData.pages)) {
      docData.pages = docData.pages.map((p: any) => ({
        ...p,
        pageTitle: stripMarkdownSyntax(p.pageTitle),
        coreTakeaway: stripMarkdownSyntax(p.coreTakeaway),
        bodyParagraphs: (p.bodyParagraphs || []).map(stripMarkdownSyntax),
        actionSteps: (p.actionSteps || []).map(stripMarkdownSyntax),
        fieldNote: stripMarkdownSyntax(p.fieldNote),
      }));
    }

    return NextResponse.json({ success: true, data: docData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Build failed" }, { status: 500 });
  }
}