import { Webhooks } from "@paddle/paddle-node-sdk";

const webhooks = new Webhooks(); // no arguments

export const config = {
  api: { bodyParser: false }, // Important: get raw body
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text(); // raw string
    const signature = req.headers.get("paddle-signature") || "";

    const notification = await webhooks.unmarshal(rawBody, process.env.PADDLE_WEBHOOK_SECRET!, signature);

    console.log("✅ Verified Paddle webhook", notification);

    // Handle your event here
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("❌ Invalid webhook", err);
    return new Response("Invalid Paddle signature", { status: 400 });
  }
}
