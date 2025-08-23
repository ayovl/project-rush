
import { Paddle } from "@paddle/paddle-node-sdk";

const paddle = new Paddle(process.env.PADDLE_WEBHOOK_SECRET!);

export const config = {
  api: { bodyParser: false }, // prevent Next.js from parsing
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text(); // get raw body as string
    const signature = req.headers.get('paddle-signature') || '';
    const notification = await paddle.webhooks.unmarshal(rawBody, process.env.PADDLE_WEBHOOK_SECRET!, signature);

    console.log("✅ Verified Paddle webhook", notification);

    // Now `notification` is already parsed and verified
    // you can switch on notification.eventType, notification.data, etc.

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("❌ Invalid webhook", err);
    return new Response("Invalid Paddle signature", { status: 400 });
  }
}
