// src/lib/ai/llmRouter.ts
interface LLMRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}

async function fetchWithAbort(url: string, options: RequestInit, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function generateWithDualLLM({
  systemPrompt,
  userPrompt,
  jsonMode = false,
  temperature = 0.65,
}: LLMRequestOptions): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // 1. PRIMARY: Fast, active Gemini Flash models with strict 12s timeout
  if (geminiKey) {
    const geminiModels = ["gemini-2.5-flash", "gemini-2.0-flash"];

    for (const modelName of geminiModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

        const res = await fetchWithAbort(
          url,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature,
                ...(jsonMode && { responseMimeType: "application/json" }),
              },
            }),
          },
          12000
        );

        if (res.ok) {
          const data = await res.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          text = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          if (text) return text;
        } else if (res.status === 404) {
          continue;
        }
      } catch (err) {
        console.warn(`Gemini (${modelName}) timed out or failed, trying next...`);
      }
    }
  }

  // 2. SECONDARY FAILOVER: OpenAI API (12s timeout)
  if (openaiKey && openaiKey.startsWith("sk-")) {
    try {
      const res = await fetchWithAbort(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            ...(jsonMode && { response_format: { type: "json_object" } }),
            temperature,
          }),
        },
        12000
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (err) {
      console.warn("OpenAI failover failed:", err);
    }
  }

  return null;
}