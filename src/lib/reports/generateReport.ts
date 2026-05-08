import OpenAI from "openai";
import { deterministicMarkdownReport, type ReportContext } from "@/lib/reports/templates";

const SYSTEM_PROMPT = `You are a franchise and commercial real estate analyst.

Generate a professional location viability report using only the structured data provided below.

Rules:
- Do not invent competitor names, distances, revenue, or facts.
- If data is missing, explicitly say "needs field validation".
- Be direct and investor-oriented.
- Include risks and red flags.
- Use Indian rupee formatting.
- Output markdown only.
- Final verdict must be one of: STRONG_PROCEED, PROCEED_WITH_FIELD_VALIDATION, BORDERLINE, AVOID.`;

export async function generateReportMarkdown(context: ReportContext) {
  if (!process.env.OPENAI_API_KEY) return deterministicMarkdownReport(context);

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Input data:\n${JSON.stringify(context, null, 2)}` },
      ],
    });
    return response.output_text || deterministicMarkdownReport(context);
  } catch {
    return deterministicMarkdownReport(context);
  }
}
