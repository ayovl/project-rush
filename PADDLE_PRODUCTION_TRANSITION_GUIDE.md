# Paddle Production Transition Guide

## 🚀 Complete Step-by-Step Guide to Move from Sandbox to Production

This guide provides detailed instructions to transition your Paddle integration from sandbox to production environment. Follow these steps carefully to ensure a smooth transition.

## 📋 Pre-Production Checklist

Before starting the transition, ensure you have:
- [ ] Thoroughly tested all payment flows in sandbox
- [ ] Verified webhook functionality in sandbox
- [ ] Completed business verification with Paddle
- [ ] Set up your business banking details in Paddle
- [ ] Prepared your production domain/hosting

---

## Step 1: Complete Paddle Business Verification

### 1.1 Business Information
1. Log into your Paddle dashboard
2. Go to **Account Settings** → **Business Information**
3. Complete all required fields:
   - Business name and registration details
   - Tax registration numbers (if applicable)
   - Business address and contact information
   - Business type and industry

### 1.2 Banking Details
1. Go to **Account Settings** → **Payouts**
2. Add your business bank account details
3. Verify your banking information (may take 1-2 business days)

### 1.3 Identity Verification
1. Upload required business documents:
   - Business registration certificate
   - Tax identification documents
   - Government-issued ID for business owner
2. Wait for Paddle's verification (typically 1-3 business days)

---

## Step 2: Create Production Products and Prices

### 2.1 Switch to Production Mode
1. In your Paddle dashboard, look for environment toggle
2. Switch from **Sandbox** to **Production**
3. You'll now see a clean production environment

### 2.2 Create Production Products
Create the same products as in sandbox:

**Product 1: Seem Basic Plan**
```
Name: Seem Basic Plan
Description: Founding Member Price - Perfect for individual creators
Tax Category: Standard
```

**Product 2: Seem Pro Plan**
```
Name: Seem Pro Plan  
Description: Founding Member Price - Ideal for growing businesses
Tax Category: Standard
```

**Product 3: Seem Ultimate Plan**
```
Name: Seem Ultimate Plan
Description: Founding Member Price - For power users and teams
Tax Category: Standard
```

### 2.3 Create Production Prices
For each product, create monthly recurring prices:

**Basic Plan Price:**
- Billing cycle: Monthly
- Price: $4.00 USD
- Trial period: None (or configure as needed)

**Pro Plan Price:**
- Billing cycle: Monthly  
- Price: $9.00 USD
- Trial period: None (or configure as needed)

**Ultimate Plan Price:**
- Billing cycle: Monthly
- Price: $29.00 USD
- Trial period: None (or configure as needed)

### 2.4 Copy Production Price IDs
After creating prices, copy the Price IDs (they start with `pri_`):
- Basic Plan Price ID: `pri_xxxxxxxxxxxxxxxxxxxxxxx`
- Pro Plan Price ID: `pri_xxxxxxxxxxxxxxxxxxxxxxx`  
- Ultimate Plan Price ID: `pri_xxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 3: Get Production API Credentials

### 3.1 Production API Key
1. Go to **Developer Tools** → **Authentication**
2. In production mode, click **Generate API Key**
3. Copy the production API key (starts with `sk_live_`)
4. Store securely - you'll add this to environment variables

### 3.2 Production Client-Side Token
1. Go to **Developer Tools** → **Client-side tokens**
2. Click **Generate client-side token**
3. Copy the production token (starts with `ct_live_`)
4. Store securely - you'll add this to environment variables

### 3.3 Production Webhook Secret
1. Go to **Developer Tools** → **Notifications**
2. Click **Create notification setting**
3. Configure webhook:
   - **URL**: `https://your-production-domain.com/api/webhooks/paddle`
   - **Events to subscribe to**:
     - `transaction.completed`
     - `transaction.updated`
     - `subscription.created`
     - `subscription.updated`
     - `subscription.activated`
     - `subscription.canceled`
     - `subscription.paused`
     - `subscription.resumed`
     - `customer.created`
     - `customer.updated`
4. Copy the webhook secret
5. Click **Create** to save the webhook

---

## Step 4: Update Environment Variables

### 4.1 Create Production Environment File
Create a new `.env.production` file or update your production environment with:

```env
# Paddle Production Configuration
PADDLE_API_KEY=sk_live_your_production_api_key_here
PADDLE_WEBHOOK_SECRET=pdl_your_production_webhook_secret_here
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=ct_live_your_production_client_token_here
NEXT_PUBLIC_PADDLE_ENV=production

# Your existing Supabase and other production vars...
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_key
```

### 4.2 Deployment Platform Configuration

**For Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the production environment variables:
   - `PADDLE_API_KEY` = `sk_live_your_production_api_key_here`
   - `PADDLE_WEBHOOK_SECRET` = `pdl_your_production_webhook_secret_here`
   - `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` = `ct_live_your_production_client_token_here`
   - `NEXT_PUBLIC_PADDLE_ENV` = `production`

**For Netlify:**
1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the same variables as above

**For other platforms:**
Configure the environment variables according to your hosting platform's documentation.

---

## Step 5: Update Production Price IDs in Code

### 5.1 Update Paddle Configuration
Update `src/lib/paddle.ts` with your production Price IDs:

```typescript
// Product catalog - Production Price IDs
export const PADDLE_PRODUCTS: Record<string, PaddleProduct> = {
  basic: {
    priceId: 'pri_your_production_basic_price_id', // Replace with actual production price ID
    planId: 'basic',
    name: 'Basic Plan',
    price: '$4/month',
    description: 'Founding Member Price'
  },
  pro: {
    priceId: 'pri_your_production_pro_price_id', // Replace with actual production price ID
    planId: 'pro',
    name: 'Pro Plan',
    price: '$9/month',
    description: 'Founding Member Price'
  },
  ultimate: {
    priceId: 'pri_your_production_ultimate_price_id', // Replace with actual production price ID
    planId: 'ultimate',
    name: 'Ultimate Plan',
    price: '$29/month',
    description: 'Founding Member Price'
  }
}
```

### 5.2 Commit and Deploy Changes
```bash
git add src/lib/paddle.ts
git commit -m "Update Paddle price IDs for production"
git push
```

---

## Step 6: Production Deployment and Testing

### 6.1 Deploy to Production
1. Deploy your application with the updated environment variables
2. Ensure the production URL matches your webhook URL in Paddle
3. Verify the deployment is successful

### 6.2 Production Testing Checklist
Test these critical flows in production:

**Payment Testing:**
- [ ] Create test subscription with real payment method (use small amount first)
- [ ] Verify customer creation in Paddle dashboard
- [ ] Check subscription appears in your Supabase database
- [ ] Test subscription cancellation
- [ ] Verify webhook delivery in Paddle dashboard

**User Experience Testing:**
- [ ] Test checkout flow from your pricing page
- [ ] Verify success page redirects correctly  
- [ ] Test user account page shows subscription status
- [ ] Verify user can access paid features after payment

**Email Notifications:**
- [ ] Customer receives payment confirmation email from Paddle
- [ ] Subscription updates trigger appropriate emails
- [ ] Cancellation emails are sent correctly

---

## Step 7: Monitor Production Setup

### 7.1 Paddle Dashboard Monitoring
Monitor these sections regularly:
- **Revenue**: Track incoming payments
- **Customers**: Monitor new customer signups
- **Subscriptions**: Track subscription lifecycle
- **Webhooks**: Ensure all webhooks are being delivered successfully

### 7.2 Application Monitoring
- Monitor your application logs for any Paddle-related errors
- Set up alerts for failed webhook processing
- Track user subscription status in your database

### 7.3 Key Metrics to Watch
- **Webhook Success Rate**: Should be >99%
- **Payment Success Rate**: Monitor for failed payments
- **Customer Support**: Be ready to handle payment-related inquiries

---

## 🚨 Important Production Considerations

### Security
- **Never expose production API keys**: Only use client-side tokens in frontend
- **Webhook Security**: Your webhook endpoint automatically verifies signatures
- **HTTPS Required**: Ensure your production site uses HTTPS
- **Environment Variables**: Never commit production keys to version control

### Compliance
- **Tax Handling**: Paddle handles tax compliance automatically
- **GDPR/Privacy**: Ensure your privacy policy covers payment processing
- **Terms of Service**: Update terms to reflect payment processing

### Customer Support
- **Paddle Customer Portal**: Customers can manage subscriptions at checkout.paddle.com
- **Refund Process**: Handle refunds through Paddle dashboard or API
- **Failed Payments**: Paddle will attempt retry payments automatically

---

## 🔧 Troubleshooting Production Issues

### Common Production Issues:

**Webhooks Not Being Received:**
1. Check webhook URL is publicly accessible
2. Verify webhook secret matches environment variable
3. Check Paddle dashboard for delivery attempts and errors
4. Ensure your server can handle POST requests to `/api/webhooks/paddle`

**Checkout Not Working:**
1. Verify `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` is production token
2. Check Price IDs are production values
3. Ensure `NEXT_PUBLIC_PADDLE_ENV=production`
4. Check browser console for JavaScript errors

**Database Issues:**
1. Verify Supabase production connection
2. Check that production Supabase has the correct schema
3. Ensure service role key has correct permissions

**Payment Failures:**
1. Check Paddle dashboard for declined payments
2. Verify business verification is complete
3. Ensure banking details are verified
4. Monitor for any API errors in logs

---

## 📞 Support Resources

- **Paddle Support**: Available through your dashboard chat
- **Paddle Documentation**: [developer.paddle.com](https://developer.paddle.com)
- **Paddle Status Page**: [status.paddle.com](https://status.paddle.com)

---

## ✅ Post-Production Launch Checklist

After successful production deployment:

- [ ] Update internal documentation with production credentials
- [ ] Set up monitoring and alerting for payment failures
- [ ] Train customer support team on Paddle customer portal
- [ ] Create runbook for handling payment-related customer issues
- [ ] Schedule regular reviews of payment analytics
- [ ] Plan for scaling (higher volume handling, multiple price points, etc.)

---

🎉 **Congratulations!** Your Paddle integration is now live in production. Monitor the first few days closely and be prepared to provide excellent customer support for any payment-related questions.

Remember: You can always switch back to sandbox for testing new features before deploying them to production.