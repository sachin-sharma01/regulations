import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const body = req.body;

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
Title: ${body.title}
Source: ${body.source}
Category: ${body.category}
Summary: ${body.summary_sv}
Required actions: ${body.required_actions}
Deadline: ${body.deadline}
Impact: ${body.impact_level}`,
        },
      ],
    }),
  });

  const data = await response.json();
  return res.status(200).json(data);
}
