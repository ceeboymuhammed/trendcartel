import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runLiveKeywordResearch } from "@/lib/scrapers/keywordEngine";
import { TOOL_CREDIT_COSTS } from "@/lib/billing/plans";
import { verifyAndDeductCredits } from "@/lib/billing/enforceCredits";

// Initialize Supabase Admin client for server-side cache read/write
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Role key on server routes
);

const CACHE_TTL_DAYS = 30; // Reuse results for 30 days (within your 30-60 day target)

function buildNormalizedCacheKey(query: string, country: string, category: string): string {
  const cleanQuery = query.toLowerCase().trim().replace(/\s+/g, " ");
  const cleanCountry = country.toLowerCase().trim();
  const cleanCategory = category.toLowerCase().trim();
  return `${cleanQuery}::${cleanCountry}::${cleanCategory}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, country = "Nigeria", category = "All" } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Please enter a valid keyword or topic." },
        { status: 400 }
      );
    }

    const cacheKey = buildNormalizedCacheKey(query, country, category);
    const nowIso = new Date().toISOString();

    // 1. CHECK CACHE FOR VALID ENTRY WITHIN 45 DAYS
    const { data: cachedRecord } = await supabase
      .from("keyword_research_cache")
      .select("id, payload, hit_count, created_at")
      .eq("cache_key", cacheKey)
      .gt("expires_at", nowIso)
      .single();

    if (cachedRecord && cachedRecord.payload) {
      // Increment hit counter asynchronously (don't block response)
      supabase
        .from("keyword_research_cache")
        .update({ hit_count: (cachedRecord.hit_count || 1) + 1 })
        .eq("id", cachedRecord.id)
        .then();

      return NextResponse.json({
        success: true,
        cached: true,
        cachedAt: cachedRecord.created_at,
        creditsDeducted: 3, // Still deducts wallet credits while costing you $0 in API tokens
        data: cachedRecord.payload,
      });
      const creditCost = TOOL_CREDIT_COSTS.discovery; // 5 credits
const userId = body.userId;

if (userId && userId !== "guest-trial-user") {
  const authCheck = await verifyAndDeductCredits({
    userId,
    toolKey: "discovery",
    creditCost,
  });

  if (!authCheck.allowed) {
    return NextResponse.json(
      { error: authCheck.error, code: authCheck.code },
      { status: authCheck.status }
    );
  }
}
    }

    // 2. CACHE MISS: RUN LIVE SCRAPERS & LLM
    const freshData = await runLiveKeywordResearch(query.trim(), country, category);

    // 3. STORE IN CACHE FOR 45 DAYS
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CACHE_TTL_DAYS);

    await supabase.from("keyword_research_cache").upsert(
      {
        cache_key: cacheKey,
        query: query.trim(),
        country,
        category,
        payload: freshData,
        hit_count: 1,
        created_at: nowIso,
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: "cache_key" }
    );

    return NextResponse.json({
      success: true,
      cached: false,
      creditsDeducted: 3,
      data: freshData,
    });
  } catch (error: any) {
    console.error("Keyword Cache/API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch keyword data." },
      { status: 500 }
    );
  }
}