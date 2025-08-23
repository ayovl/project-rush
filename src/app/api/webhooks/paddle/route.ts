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
  const rawBody = await req.text();

  // Debug: log the first 200 chars of the raw body
  console.log("[PaddleWebhook] rawBody preview:", rawBody.slice(0, 200));
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
  console.log("[PaddleWebhook] computed:", computed);
  console.log("[PaddleWebhook] h1:", h1);
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
