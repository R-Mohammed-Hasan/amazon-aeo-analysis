import OpenAI from "openai";

export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

/**
 * Model roles — each model used where it excels.
 *
 * PARSER         → structured JSON output, classification, fast cheap tasks
 *                  gpt-4o-mini: best-in-class for following JSON schemas precisely
 *
 * WRITER         → copy critique, creative rewriting, Amazon copywriting
 *                  claude-haiku-4.5: latest Claude fast model, near-Sonnet quality
 *                  outperforms older haiku-3 on language + instruction following
 *
 * AEO_*          → simulates what each AI actually recommends to shoppers
 *                  each uses the model shoppers actually interact with
 *
 * AEO_PERPLEXITY → real-time web search; most accurate AEO signal
 *                  sonar-pro: deeper citations, better ranking accuracy than sonar
 */
export const MODELS = {
  PARSER: "openai/gpt-4o-mini",

  // Listing extraction — large noisy markdown, needs 200k context + strong
  // instruction following to ignore warranty sections, nav, carousels, etc.
  EXTRACTOR: "anthropic/claude-sonnet-4-5",

  WRITER: "anthropic/claude-3.5-haiku",

  AEO_GPT: "openai/gpt-4o-mini",
  AEO_CLAUDE: "anthropic/claude-haiku-4.5",
  AEO_GEMINI: "google/gemini-2.5-flash-lite",
  AEO_PERPLEXITY: "perplexity/sonar",
} as const;

export async function chat(
  model: string,
  prompt: string,
  temperature = 0.3,
): Promise<string> {
  const res = await openrouter.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature,
  });
  return res.choices[0].message.content ?? "";
}
