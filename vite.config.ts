import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { findCelestialItem } from "./src/celestialCatalog";
import { generateCelestialInfo } from "./src/celestialInfoService";

function readBody(req: Parameters<Parameters<Plugin["configureServer"]>[0]["middlewares"]["use"]>[1]) {
  return new Promise<string>((resolve) => {
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", () => resolve(rawBody));
  });
}

function geminiDevApi(): Plugin {
  return {
    name: "gemini-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/celestial-info", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        res.setHeader("content-type", "application/json; charset=utf-8");

        try {
          const { id, name } = JSON.parse(await readBody(req)) as { id?: string; name?: string };
          const item = id ? findCelestialItem(id) : undefined;

          if (!item) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: "Unknown celestial body" }));
            return;
          }

          res.end(JSON.stringify(await generateCelestialInfo(item.id, name ?? item.name, process.env.GEMINI_API_KEY)));
        } catch {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: "Failed to generate celestial info" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;

  return {
    plugins: [react(), geminiDevApi()],
  };
});
