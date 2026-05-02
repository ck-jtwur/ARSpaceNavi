import { findCelestialItem } from "../src/celestialCatalog";
import { generateCelestialInfo, withFallbackMeta } from "../src/celestialInfoService";
import { celestialFallbackInfo } from "../src/celestialCatalog";

declare const process: {
  env: {
    GEMINI_API_KEY?: string;
  };
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const { id, name } = (await request.json()) as { id?: string; name?: string };
  const item = id ? findCelestialItem(id) : undefined;

  if (!item) {
    return jsonResponse({ error: "Unknown celestial body" }, 400);
  }

  try {
    return jsonResponse(await generateCelestialInfo(item.id, name ?? item.name, process.env.GEMINI_API_KEY));
  } catch {
    return jsonResponse(withFallbackMeta(celestialFallbackInfo[item.id], [], "api-handler-error"));
  }
}

type VercelRequestLike = {
  method?: string;
  body?: unknown;
};

type VercelResponseLike = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => VercelResponseLike;
  json: (body: unknown) => void;
};

export default async function handler(req: VercelRequestLike, res: VercelResponseLike) {
  res.setHeader("content-type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = typeof req.body === "string" ? (JSON.parse(req.body) as { id?: string; name?: string }) : req.body;
  const { id, name } = (body ?? {}) as { id?: string; name?: string };
  const item = id ? findCelestialItem(id) : undefined;

  if (!item) {
    res.status(400).json({ error: "Unknown celestial body" });
    return;
  }

  try {
    res.status(200).json(await generateCelestialInfo(item.id, name ?? item.name, process.env.GEMINI_API_KEY));
  } catch {
    res.status(200).json(withFallbackMeta(celestialFallbackInfo[item.id], [], "api-handler-error"));
  }
}
