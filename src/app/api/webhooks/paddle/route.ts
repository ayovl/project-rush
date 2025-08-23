
// Enforce Node.js runtime for Vercel (prevents edge runtime issues)
export const runtime = "nodejs";
import crypto from "crypto";


export const config = {
  api: { bodyParser: false },
};

function parsePaddleSignatureHeader(header: string) {
  if (!header) return null;
  const m = header.match(/ts=(\d+);h1=([0-9a-fA-F]+)/);
  if (!m) return null;
  return { ts: m[1], h1: m[2] };
}

export async function POST(req: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const signatureHeader = req.headers.get("paddle-signature") || req.headers.get("Paddle-Signature") || "";
  const contentType = req.headers.get("content-type") || req.headers.get("Content-Type") || "";
  const rawBody = await req.text();

  // Enhanced debug logging
  const rawBodyHex = Buffer.from(rawBody, "utf8").toString("hex");
  console.log("[PaddleWebhook] content-type:", contentType);
  console.log("[PaddleWebhook] rawBody (first 200 chars):", rawBody.slice(0, 200));
  console.log("[PaddleWebhook] rawBody hex (first 200 bytes):", rawBodyHex.slice(0, 400));
  console.log("[PaddleWebhook] signatureHeader:", signatureHeader);
  if (!secret) {
    console.error("[PaddleWebhook] No webhook secret set");
    return new Response("No webhook secret", { status: 500 });
  }
  if (!signatureHeader) {
    console.error("[PaddleWebhook] No signature header");
    return new Response("No signature header", { status: 400 });
  }
  const parsed = parsePaddleSignatureHeader(signatureHeader);
  if (!parsed) {
    console.error("[PaddleWebhook] Could not parse signature header");
    return new Response("Invalid signature header", { status: 400 });
  }
  const { ts, h1 } = parsed;
  const payload = `${ts}:${rawBody}`;
  const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  console.log("[PaddleWebhook] ts:", ts);
  console.log("[PaddleWebhook] computed HMAC:", computed);
  console.log("[PaddleWebhook] h1 (from header):", h1);
  if (computed !== h1) {
    console.error("[PaddleWebhook] Signature mismatch");
    return new Response("Invalid Paddle signature", { status: 400 });
  }
  // If you want, parse the body as JSON here
  let notification = null;
  try {
    notification = JSON.parse(rawBody);
  } catch (e) {
    // Not JSON, could be form-encoded
    notification = rawBody;
  }
  console.log("✅ Verified Paddle webhook", notification);
  return new Response("ok", { status: 200 });
}
