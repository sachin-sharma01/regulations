import type { VercelRequest, VercelResponse } from "@vercel/node";

const ALLOWED_ORIGIN =
  process.env.ALLOWED_ORIGIN || "https://regulation-ui.vercel.app";

const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  "https://sharmajiastro.duckdns.org/webhook/regulation-search";

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

  const question = req.body?.question;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Missing required field: question" });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.slice(0, 2000) }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: errText });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (e: any) {
    console.error("Webhook fetch error:", e.message, e.cause);
    return res.status(502).json({
      error: "Failed to reach n8n webhook",
      detail: e.message,
    });
  }
}
