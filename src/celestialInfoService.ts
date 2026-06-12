import { CelestialId, CelestialInfo, getRandomCelestialFallbackInfo } from "./celestialCatalog.js";
import { supportedGeminiModels } from "./geminiModels.js";

export function withFallbackMeta(fallback: CelestialInfo, triedModels: string[] = [], fallbackReason?: string): CelestialInfo {
  return {
    ...fallback,
    source: "fallback",
    modelUsed: undefined,
    triedModels,
    fallbackReason,
  };
}

export function parseGeminiJson(text: string, fallback: CelestialInfo, modelUsed: string, triedModels: string[]): CelestialInfo {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<CelestialInfo>;
  const description = String(parsed.description ?? fallback.description).trim();

  return {
    name: String(parsed.name ?? fallback.name),
    distanceString: String(parsed.distanceString ?? fallback.distanceString),
    description,
    source: "gemini",
    modelUsed,
    triedModels,
  };
}

export function buildCelestialPrompt(name: string) {
  return [
    "あなたは天文学の解説者です。宇宙に詳しくない一般の人に向けて説明します。",
    `天体「${name}」について、観測・研究によって判明している事実のみをJSONで回答してください。`,
    "description には、大きさ・温度・構成物質・環境・観測で分かっていることなど、実測または理論計算に基づく事実を含めてください。",
    "専門用語を使う場合は、簡単な言い換えや補足を添えて、宇宙の知識がない人にも伝わるよう平易な言葉で書いてください。",
    "「ロマン」「神秘」「壮大」などの感情的・詩的な表現は使わないでください。",
    "description は日本語の敬体（です・ます調）で80文字から110文字程度。必ず敬体で統一し、途中で切らず句点「。」で完結させてください。",
    "distanceString は、太陽系内の天体なら「約何万km」「約何億km」のようにkmで、太陽系外の天体なら光年で書いてください。",
    '形式: {"name":"天体名","distanceString":"地球からの距離","description":"説明"}',
  ].join("\n");
}

export async function generateCelestialInfo(id: CelestialId, name: string, apiKey: string | undefined): Promise<CelestialInfo> {
  const fallback = getRandomCelestialFallbackInfo(id);
  const triedModels: string[] = [];

  if (!apiKey) {
    return withFallbackMeta(fallback, triedModels, "missing-api-key");
  }

  const prompt = buildCelestialPrompt(name);
  const errors: string[] = [];

  for (const model of supportedGeminiModels) {
    triedModels.push(model);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  distanceString: { type: "STRING" },
                  description: { type: "STRING" },
                },
                required: ["name", "distanceString", "description"],
              },
              temperature: 0.5,
              maxOutputTokens: 320,
            },
          }),
        },
      );

      if (!response.ok) {
        errors.push(`${model}:http-${response.status}`);
        continue;
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return parseGeminiJson(text, fallback, model, triedModels);
      }
      errors.push(`${model}:empty-response`);
    } catch {
      errors.push(`${model}:request-failed`);
      continue;
    }
  }

  return withFallbackMeta(fallback, triedModels, errors.slice(0, 4).join(",") || "all-models-failed");
}
