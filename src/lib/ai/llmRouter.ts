interface LLMRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 45000) {
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
  const rawGeminiKey = process.env.GEMINI_API_KEY || "";
  const geminiKey = rawGeminiKey.replace(/^["']|["']$/g, "").trim();

  const rawOpenaiKey = process.env.OPENAI_API_KEY || "";
  const openaiKey = rawOpenaiKey.replace(/^["']|["']$/g, "").trim();

  if (geminiKey) {
    // Only use Flash / Flash-Lite models (Pro models have limit: 0 on Gemini Free Tier)
    const geminiModels = [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
    ];

    for (const modelName of geminiModels) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[LLM Router] Calling ${modelName} (attempt ${attempt})...`);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

          const bodyPayload: Record<string, unknown> = {
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: userPrompt }],
              },
            ],
            generationConfig: {
              temperature,
              ...(jsonMode && { responseMimeType: "application/json" }),
            },
          };

          const res = await fetchWithTimeout(
            url,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bodyPayload),
            },
            45000 // 45s timeout so structured JSON never gets cut off prematurely
          );

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              console.log(`[LLM Router] Success from ${modelName}`);
              return text;
            }
          } else {
            const errText = await res.text();
            console.error(`[Gemini ${modelName} Attempt ${attempt} HTTP ${res.status}]:`, errText);

            if (res.status === 503 && attempt === 1) {
              await sleep(1500);
              continue;
            }
            break;
          }
        } catch (err: any) {
          console.error(`[Gemini ${modelName} Error/Timeout]:`, err?.name || err?.message || err);
          break;
        }
      }
    }
  } else {
    console.warn("[LLM Router]: GEMINI_API_KEY is missing in .env.local");
  }

  if (openaiKey && openaiKey.startsWith("sk-")) {
    try {
      const res = await fetchWithTimeout(
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
        20000
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (err) {
      console.error("[OpenAI Error/Timeout]:", err);
    }
  }

  return null;
}