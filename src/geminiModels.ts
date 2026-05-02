export const supportedGeminiModels = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-3-flash-preview",
  "gemini-3.1-flash-lite-preview",
] as const;

export type SupportedGeminiModel = (typeof supportedGeminiModels)[number];
