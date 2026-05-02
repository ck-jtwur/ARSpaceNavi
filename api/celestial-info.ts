import { celestialFallbackInfo, findCelestialItem } from "../src/celestialCatalog.js";
import { generateCelestialInfo, withFallbackMeta } from "../src/celestialInfoService.js";

declare const process: {
  env: {
    GEMINI_API_KEY?: string;
  };
};

type VercelRequestLike = {
  method?: string;
  body?: unknown;
};

type VercelResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => VercelResponseLike;
  json: (body: unknown) => void;
};

function parseRequestBody(body: unknown): { id?: string; name?: string } {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    return JSON.parse(body) as { id?: string; name?: string };
  }

  return body as { id?: string; name?: string };
}

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  res.setHeader("content-type", "application/json; charset=utf-8");

  if (req.method === "GET") {
    res.status(200).json({
      ok: true,
      api: "celestial-info",
      keyConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { id, name } = parseRequestBody(req.body);
    const item = id ? findCelestialItem(id) : undefined;

    if (!item) {
      res.status(400).json({ error: "Unknown celestial body" });
      return;
    }

    const info = await generateCelestialInfo(item.id, name ?? item.name, process.env.GEMINI_API_KEY);
    res.status(200).json(info);
  } catch {
    res.status(200).json(withFallbackMeta(celestialFallbackInfo.moon, [], "api-handler-error"));
  }
}
