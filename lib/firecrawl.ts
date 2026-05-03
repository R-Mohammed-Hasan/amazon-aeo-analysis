import FirecrawlApp from "@mendable/firecrawl-js";
import { chat, MODELS } from "@/lib/openrouter";
import { ListingData } from "@/types";

const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });

export async function scrapeAmazonListing(url: string): Promise<ListingData> {
  const result = await firecrawl.scrape(url, {
    formats: ["markdown"],
    onlyMainContent: false,
  });
  if (!result.markdown)
    throw new Error("Failed to scrape listing — no content returned");
  return parseListing(result.markdown, url);
}

async function parseListing(
  markdown: string,
  url: string,
): Promise<ListingData> {
  // ── ASIN — URL-deterministic, no LLM needed ──────────────────────────────
  const asinMatch = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/);
  const asin = asinMatch?.[1] ?? "";

  // ── Images — aplus prefix is specific enough for regex ────────────────────
  const imageMatches =
    markdown.match(
      /https?:\/\/m\.media-amazon\.com\/images\/S\/aplus-media-library-service-media\/[^\s"')\]>]+\.(?:jpg|jpeg|png|webp)/gi,
    ) ?? [];
  const imageUrls = [...new Set(imageMatches)].slice(0, 8);

  // ── Everything else — LLM extraction ─────────────────────────────────────
  // Regex is too brittle: warranty add-on sections, "Customers who viewed"
  // carousels, nav panels, and the actual product all look identical structurally.
  // gpt-4o-mini understands context and can reliably pick the main product.
  const extracted = await extractWithLLM(markdown);

  return {
    asin,
    imageUrls,
    title: extracted.title ?? "",
    bullets: extracted.bullets ?? [],
    description: extracted.description ?? "",
    brand: extracted.brand ?? "",
    category: extracted.category ?? "",
    price: extracted.price ?? "",
    bsr: extracted.bsr ?? "",
    rating: extracted.rating ?? "",
    reviewCount: extracted.reviewCount ?? "",
  };
}

type ExtractedFields = {
  title: string;
  brand: string;
  category: string;
  price: string;
  rating: string;
  reviewCount: string;
  bsr: string;
  bullets: string[];
  description: string;
};

async function extractWithLLM(markdown: string): Promise<ExtractedFields> {
  const prompt = `Identify the product first and then extract product listing data from this Amazon page markdown. Return ONLY valid JSON, no other text.

RULES:
- Extract data for the MAIN product being sold on this page only
- IGNORE completely: warranty/insurance add-on sections, "Customers who viewed" carousels, "Keyboard shortcuts" panels, navigation menus, breadcrumbs, sponsored products, related product sections
- bullets: 3–7 actual product feature bullet points (what the product does/has), NOT warranty terms or claim instructions
- description: prose description of the product, max 400 chars, NOT nav links or section headers
- price: include currency symbol (e.g. ₹1,499 or $29.99)
- rating: just the number (e.g. 4.3)
- reviewCount: just the number with commas if present (e.g. 1,251)
- bsr: just the rank number (e.g. 1136), no # symbol
- If a field is not found, use ""

JSON schema to return:
{
  "title": "",
  "brand": "",
  "category": "",
  "price": "",
  "rating": "",
  "reviewCount": "",
  "bsr": "",
  "bullets": [],
  "description": ""
}

MARKDOWN (truncated to first 8000 chars):
${markdown.slice(0, 8000)}`;

  const raw = await chat(MODELS.PARSER, prompt, 0);
  const json = raw.replace(/```json\n?|```/g, "").trim();
  return JSON.parse(json);
}
