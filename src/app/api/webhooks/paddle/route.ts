// Enforce Node.js runtime for Vercel (prevents edge runtime issues)
export const runtime = "nodejs";

export const config = {
  api: { bodyParser: false },
};

import { Webhooks } from "@paddle/paddle-node-sdk";
import { createHmac, timingSafeEqual } from "crypto";

const webhooks = new Webhooks();

// Log the environment and secret (first 6 chars only for safety)
console.log("[PaddleWebhook] ENV:", process.env.NODE_ENV);
console.log("[PaddleWebhook] Using secret (first 6 chars):", (process.env.PADDLE_WEBHOOK_SECRET || '').slice(0, 6));

export async function POST(req: Request) {
  const signatureHeader = req.headers.get("paddle-signature") || req.headers.get("Paddle-Signature") || req.headers.get("PADDLE-SIGNATURE") || "";
  if (!signatureHeader) {
    console.error("❌ Paddle signature header is missing!");
  }
  const contentType = req.headers.get("content-type") || req.headers.get("Content-Type") || "";
  const contentLength = req.headers.get("content-length") || req.headers.get("Content-Length") || "";
  const rawBody = await req.text();
  const rawBodyBuffer = Buffer.from(rawBody, "utf8");
  // Enhanced debug logging
  const rawBodyHex = rawBodyBuffer.toString("hex");
  console.log("[PaddleWebhook] content-type:", contentType);
  console.log("[PaddleWebhook] content-length header:", contentLength);
  console.log("[PaddleWebhook] rawBody length:", rawBody.length);
  console.log("[PaddleWebhook] rawBodyBuffer length:", rawBodyBuffer.length);
  console.log("[PaddleWebhook] rawBody (first 200 chars):", rawBody.slice(0, 200));
  console.log("[PaddleWebhook] rawBody hex (first 200 bytes):", rawBodyHex.slice(0, 400));
  console.log("[PaddleWebhook] signatureHeader:", signatureHeader);

  // Try SDK verification with string
  let sdkVerified = false;
  let notification = null;
  try {
    notification = webhooks.unmarshal(rawBody, signatureHeader, process.env.PADDLE_WEBHOOK_SECRET!);
    sdkVerified = true;
    console.log("✅ Verified Paddle webhook (SDK, string)", notification);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("❌ SDK verification (string) failed:", err);
  }

  // The Paddle SDK may not accept Buffer, so we skip this if it throws a type error
  // If you upgrade SDK and it supports Buffer, you can try this block:
  /*
  try {
    notification = webhooks.unmarshal(rawBodyBuffer, signatureHeader, process.env.PADDLE_WEBHOOK_SECRET!);
    sdkVerified = true;
    console.log("✅ Verified Paddle webhook (SDK, Buffer)", notification);
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("❌ SDK verification (Buffer) failed:", err);
  }
  */

  // Manual verification fallback
  try {
    // Parse signature header: ts=...;h1=...
    const parts = signatureHeader.split(';').reduce((acc, part) => {
      const [k, v] = part.split('=');
      if (k && v) acc[k.trim()] = v.trim();
      return acc;
    }, {} as Record<string, string>);
    const ts = parts['ts'];
    const h1 = parts['h1'];
    if (!ts || !h1) throw new Error('Missing ts or h1 in signature header');
    const signedPayload = `${ts}:${rawBody}`;
    const secret = process.env.PADDLE_WEBHOOK_SECRET!;
    const hmac = createHmac('sha256', secret).update(signedPayload).digest('hex');
    const valid = timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(h1, 'hex'));
    console.log(`[PaddleWebhook] Manual verification: computed hmac=${hmac.slice(0, 12)}... matches h1=${h1.slice(0, 12)}... ?`, valid);
    if (valid) {
      console.log("✅ Verified Paddle webhook (manual HMAC)");
      return new Response("ok", { status: 200 });
    } else {
      throw new Error('Manual HMAC verification failed');
    }
  } catch (err) {
    console.error("❌ Manual verification failed:", err);
    console.error("[PaddleWebhook] Secret used:", (process.env.PADDLE_WEBHOOK_SECRET || '').slice(0, 6));
    console.error("[PaddleWebhook] Signature header:", signatureHeader);
    console.error("[PaddleWebhook] Raw body (first 200 chars):", rawBody.slice(0, 200));
    return new Response("Invalid Paddle signature", { status: 400 });
  }
}
