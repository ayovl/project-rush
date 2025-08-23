// Enforce Node.js runtime for Vercel (prevents edge runtime issues)
export const runtime = "nodejs";

export const config = {
  api: { bodyParser: false },
};

import { Webhooks } from "@paddle/paddle-node-sdk";

const webhooks = new Webhooks();

export async function POST(req: Request) {
  const signatureHeader = req.headers.get("paddle-signature") || req.headers.get("Paddle-Signature") || "";
  const contentType = req.headers.get("content-type") || req.headers.get("Content-Type") || "";
  const rawBody = await req.text();
  // Enhanced debug logging
  const rawBodyHex = Buffer.from(rawBody, "utf8").toString("hex");
  console.log("[PaddleWebhook] content-type:", contentType);
  console.log("[PaddleWebhook] rawBody (first 200 chars):", rawBody.slice(0, 200));
  console.log("[PaddleWebhook] rawBody hex (first 200 bytes):", rawBodyHex.slice(0, 400));
  console.log("[PaddleWebhook] signatureHeader:", signatureHeader);

  try {
    const notification = webhooks.unmarshal(rawBody, signatureHeader, process.env.PADDLE_WEBHOOK_SECRET!);
    console.log("✅ Verified Paddle webhook (SDK)", notification);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("❌ Invalid webhook", err);
    return new Response("Invalid Paddle signature", { status: 400 });
  }
}
