# Paddle Integration Setup Guide

## Overview
This guide will help you complete the Paddle payment integration for Project Rush. The code is already implemented - you just need to configure your Paddle account and update the environment variables.

## 🚀 Quick Setup Steps

### 1. Create Your Paddle Account
1. Go to [Paddle.com](https://paddle.com) and sign up
2. Complete the account verification process
3. You'll start in **Sandbox mode** automatically (perfect for testing)

### 2. Get Your API Credentials

#### A. Get API Key
1. In your Paddle dashboard, go to **Developer Tools** → **Authentication**
2. Click **Generate API Key**
3. Copy the API key (starts with `sk_`)

#### B. Get Client-Side Token
1. Go to **Developer Tools** → **Client-side tokens**
2. Click **Generate client-side token**
3. Copy the token (starts with `ct_`)

#### C. Get Webhook Secret
1. Go to **Developer Tools** → **Notifications**
2. Click **Create notification setting**
3. Set URL to: `https://your-domain.com/api/webhooks/paddle` (replace with your actual domain)
4. Select these events:
   - `transaction.completed`
   - `subscription.created`
   - `subscription.updated` 
   - `subscription.activated`
   - `subscription.canceled`
   - `customer.created`
5. Copy the webhook secret

### 3. Create Your Products

#### A. Create Products
1. Go to **Catalog** → **Products**
2. Create 3 products:
   - **DePIX Basic Plan** 
   - **DePIX Pro Plan**
   - **DePIX Ultimate Plan**

#### B. Create Prices for Each Product
For each product, create a recurring monthly price:

**Basic Plan:**
- Amount: $4.00 USD
- Billing cycle: Monthly
- Trial period: None (since this is pre-order)

**Pro Plan:**
- Amount: $9.00 USD  
- Billing cycle: Monthly
- Trial period: None

**Ultimate Plan:**
- Amount: $29.00 USD
- Billing cycle: Monthly  
- Trial period: None

#### C. Copy Price IDs
After creating prices, copy the Price IDs (they look like `pri_01h123...`)

### 4. Update Environment Variables

Update your `.env.local` file with the actual values:

```bash
# Paddle Configuration (Sandbox)
PADDLE_API_KEY=sk_your_actual_api_key_here
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ct_your_actual_client_token_here
PADDLE_WEBHOOK_SECRET=your_actual_webhook_secret_here
NEXT_PUBLIC_PADDLE_ENV=sandbox
```

### 5. Update Product Configuration

Edit `src/lib/paddle.ts` and replace the placeholder price IDs with your actual ones:

```typescript
// Product catalog - these will be your actual Paddle price IDs
export const PADDLE_PRODUCTS: Record<string, PaddleProduct> = {
  basic: {
    priceId: 'pri_01your_actual_basic_price_id', // ← Replace this
    planId: 'basic',
    name: 'Basic Plan',
    price: '$4/month',
    description: 'Founding Member Price'
  },
  pro: {
    priceId: 'pri_01your_actual_pro_price_id', // ← Replace this
    planId: 'pro',
    name: 'Pro Plan', 
    price: '$9/month',
    description: 'Founding Member Price'
  },
  ultimate: {
    priceId: 'pri_01your_actual_ultimate_price_id', // ← Replace this
    planId: 'ultimate',
    name: 'Ultimate Plan',
    price: '$29/month',
    description: 'Founding Member Price'
  }
}
```

## 🧪 Testing the Integration

### 1. Test Payments
1. Start your development server: `npm run dev`
2. Go to `/pricing` 
3. Click "Pre-order" on any plan
4. Use Paddle's test card numbers:
   - Card: `4000 0000 0000 0002`
   - Expiry: Any future date
   - CVC: Any 3 digits

### 2. Test Webhooks
1. Use [ngrok](https://ngrok.com) to expose your local server:
   ```bash
   npx ngrok http 3000
   ```
2. Update your Paddle notification URL to: `https://your-ngrok-url.ngrok.io/api/webhooks/paddle`
3. Complete a test transaction
4. Check your server logs to see webhook events

### 3. Verify Database Integration
After a successful test transaction:
1. Check your Supabase dashboard
2. Look in the `subscriptions` table for the new record
3. Check the `profiles` table for updated `paddle_customer_id`

## 🔄 Going Live (When Ready)

### 1. Switch to Production
1. In Paddle dashboard, click **Go Live** 
2. Complete the live account verification
3. Update environment variable: `NEXT_PUBLIC_PADDLE_ENV=production`

### 2. Update Webhook URL
Update your notification setting URL to your production domain:
`https://your-production-domain.com/api/webhooks/paddle`

### 3. Test Production
Complete a small real transaction to verify everything works.

## 📊 What's Already Implemented

✅ **Server-side Paddle SDK integration**
✅ **Client-side Paddle.js checkout**  
✅ **Webhook handlers for all payment events**
✅ **Supabase database integration**
✅ **User authentication integration**
✅ **Success page with confirmation**
✅ **Error handling and logging**

## 🚨 Important Notes

1. **Start in Sandbox**: Always test thoroughly in sandbox before going live
2. **Webhook Security**: The webhook endpoint verifies signatures automatically
3. **Database Sync**: Customer and subscription data automatically syncs to Supabase
4. **User Authentication**: Works with both authenticated and guest users
5. **Error Handling**: Comprehensive error handling for failed payments

## 🛠️ Troubleshooting

### Common Issues:

**"Missing API Key" Error:**
- Ensure `PADDLE_API_KEY` is set in `.env.local`
- Restart your development server after adding environment variables

**Checkout Not Opening:**
- Check browser console for errors
- Verify `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is correct
- Ensure Price IDs match your Paddle products

**Webhooks Not Working:**
- Check webhook URL is accessible
- Verify webhook secret matches
- Check server logs for webhook processing errors

## 📞 Support

- **Paddle Documentation**: [developer.paddle.com](https://developer.paddle.com)
- **Paddle Support**: Available through your dashboard
- **Test Cards**: [Paddle test card numbers](https://developer.paddle.com/build/transactions/test-transactions)

---

Once you complete these steps, your Paddle integration will be fully functional! 🎉
