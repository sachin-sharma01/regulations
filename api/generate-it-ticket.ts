import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "https://regulation-ui.vercel.app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body;

  if (!body?.title || typeof body.title !== "string") {
    return res.status(400).json({ error: "Missing required field: title" });
  }

  const title = body.title.slice(0, 500);
  const source = String(body.source || "").slice(0, 200);
  const category = String(body.category || "").slice(0, 100);
  const summary_sv = String(body.summary_sv || "").slice(0, 2000);
  const required_actions = String(body.required_actions || "").slice(0, 2000);
  const deadline = String(body.deadline || "").slice(0, 50);
  const impact_level = String(body.impact_level || "").slice(0, 50);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      "x-api-key": process.env.CLAUDE_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2500,
      system: `You are a technical architect at a Swedish mortgage bank. Stack is .NET / C#.
Analyse regulatory changes and produce technical implementation guidance for developers.
Return ONLY a JSON object — no markdown, no extra text:
{
  "requires_it_change": true or false,
  "technical_spec": "Plain English description of exactly what needs to change in the system.",
  "csharp_code": "Realistic C# skeleton code with comments referencing the regulation and deadline.",
  "ai_prompt": "Complete ready-to-paste prompt for Cursor or GitHub Copilot. Include .NET/C# stack, regulation requirement, what to implement, and xUnit tests to write."
}`,
      messages: [
        {
          role: "user",
          content: `Analyse this regulation and generate IT implementation guidance:
Title: ${title}
Source: ${source}
Category: ${category}
Summary: ${summary_sv}
Required actions: ${required_actions}
Deadline: ${deadline}
Impact: ${impact_level}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    console.error("Anthropic API error:", response.status, errBody);
    return res
      .status(502)
      .json({ error: "AI analysis failed", status: response.status });
  }

  const data = await response.json();
  return res.status(200).json(data);
}
