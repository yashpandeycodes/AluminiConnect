import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export type GeminiTextResult = {
  text: string;
};

/**
 * Generic text generation call. Keep all prompt construction in
 * lib/ai/prompts.ts — this function just sends and returns text.
 */
export async function generateText(prompt: string): Promise<GeminiTextResult> {
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return { text };
  } catch (err) {
    console.error("Gemini API error:", err);
    throw new Error("AI_GENERATION_FAILED");
  }
}

/**
 * For structured output (e.g. ATS score, skill gap list), force JSON
 * and parse defensively — Gemini sometimes wraps JSON in markdown fences.
 */
export async function generateJSON<T>(prompt: string): Promise<T> {
  const jsonInstruction =
    prompt +
    "\n\nRespond with ONLY valid JSON. No markdown fences, no preamble, no explanation.";
  const { text } = await generateText(jsonInstruction);
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("Failed to parse Gemini JSON response:", cleaned);
    throw new Error("AI_RESPONSE_PARSE_FAILED");
  }
}
