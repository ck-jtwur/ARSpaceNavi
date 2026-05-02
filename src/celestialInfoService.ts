import { CelestialId, CelestialInfo, celestialFallbackInfo } from "./celestialCatalog";
import { supportedGeminiModels } from "./geminiModels";

export function withFallbackMeta(fallback: CelestialInfo, triedModels: string[] = []): CelestialInfo {
  return {
    ...fallback,
    source: "fallback",
    modelUsed: undefined,
    triedModels,
  };
}

export function parseGeminiJson(text: string, fallback: CelestialInfo, modelUsed: string, triedModels: string[]): CelestialInfo {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned) as Partial<CelestialInfo>;

  return {
    name: String(parsed.name ?? fallback.name),
    distanceString: String(parsed.distanceString ?? fallback.distanceString),
    description: String(parsed.description ?? fallback.description).slice(0, 130),
    source: "gemini",
    modelUsed,
    triedModels,
  };
}

export function buildCelestialPrompt(name: string) {
  return [
    "あなたは天文学の専門家です。",
    `ユーザーがタップした天体「${name}」について、JSONだけで回答してください。`,
    "description は距離の説明を避け、物理的特徴、重力、環境、発見の面白さ、宇宙のロマンのいずれかを含めてください。",
    "description は日本語の敬体（です・ます調）で90文字から120文字程度。必ず敬体で統一してください。",
    "distanceString は、太陽系内の天体なら「約何万km」「約何億km」のようにkmで、太陽系外の天体なら光年で書いてください。",
    '形式: {"name":"天体名","distanceString":"地球からの距離","description":"距離以外の説明"}',
  ].join("\n");
}

export async function generateCelestialInfo(id: CelestialId, name: string, apiKey: string | undefined): Promise<CelestialInfo> {
  const fallback = celestialFallbackInfo[id];
  const triedModels: string[] = [];

  if (!apiKey) {
    return withFallbackMeta(fallback, triedModels);
  }

  const prompt = buildCelestialPrompt(name);

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
              temperature: 0.5,
            },
          }),
        },
      );

      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return parseGeminiJson(text, fallback, model, triedModels);
      }
    } catch {
      continue;
    }
  }

  return withFallbackMeta(fallback, triedModels);
}
