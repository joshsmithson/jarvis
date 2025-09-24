# Stripe Integration Setup Guide

This guide will walk you through setting up Stripe products, prices, and webhooks for your Jarvis AI application.

## 1. Create Stripe Products and Prices

### Step 1: Access Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** for development
3. Navigate to **Products** in the sidebar

### Step 2: Create Products

Create these three products in your Stripe dashboard:

#### Starter Plan
- **Name**: Jarvis AI - Starter Plan
- **Description**: 50 conversations per month with priority processing
- **Price**: £9.00 GBP / month (recurring)
- **Billing**: Monthly
- **Price ID**: Copy this (e.g., `price_1234567890`)

#### Pro Plan
- **Name**: Jarvis AI - Pro Plan  
- **Description**: 200 conversations per month with advanced features
- **Price**: £29.00 GBP / month (recurring)
- **Billing**: Monthly
- **Price ID**: Copy this (e.g., `price_0987654321`)

#### Business Plan
- **Name**: Jarvis AI - Business Plan
- **Description**: 1000 conversations per month with enterprise features
- **Price**: £99.00 GBP / month (recurring)
- **Billing**: Monthly
- **Price ID**: Copy this (e.g., `price_1122334455`)

### Step 3: Update Price IDs in Code

Replace the placeholder price IDs in `src/lib/stripe.ts`:

```typescript
export const STRIPE_PRICES = {
  free: null,
  starter: 'price_YOUR_STARTER_PRICE_ID', // Replace with actual price ID
  pro: 'price_YOUR_PRO_PRICE_ID',         // Replace with actual price ID
  business: 'price_YOUR_BUSINESS_PRICE_ID', // Replace with actual price ID
} as const;
```

Also update the mapping in `src/app/api/stripe/webhooks/route.ts`:

```typescript
function getPlanFromPriceId(priceId: string): string | null {
  const priceToplanMap: Record<string, string> = {
    'price_YOUR_STARTER_PRICE_ID': 'starter',   // Replace with actual price ID
    'price_YOUR_PRO_PRICE_ID': 'pro',           // Replace with actual price ID
    'price_YOUR_BUSINESS_PRICE_ID': 'business', // Replace with actual price ID
  };

  return priceToplanMap[priceId] || null;
}
```

## 2. Set Up Stripe Webhooks

### Step 1: Create Webhook Endpoint
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set **Endpoint URL** to: `https://yourdomain.com/api/stripe/webhooks`
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Step 2: Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Update your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
```

## 3. Configure Stripe Customer Portal

### Step 1: Enable Customer Portal
1. In Stripe Dashboard, go to **Settings** → **Customer Portal**
2. Enable the customer portal
3. Configure these settings:
   - **Business information**: Add your business name and support email
   - **Functionality**: Enable subscription cancellation and plan changes
   - **Appearance**: Customize colors to match your brand

### Step 2: Test Customer Portal
- The portal will be available at `/api/stripe/portal` in your app
- Users can manage their subscriptions, update payment methods, and download invoices

## 4. Test the Integration

### Step 1: Test Checkout Flow
1. Visit your app's landing page
2. Click on a paid plan's "Get Started" button
3. Complete the test checkout with a test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits

### Step 2: Test Webhooks
1. Use Stripe CLI to test webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```
2. Trigger test events:
   ```bash
   stripe trigger checkout.session.completed
   ```

### Step 3: Verify Database Updates
- Check that user plans are updated in your Supabase database
- Verify usage limits are applied correctly
- Test the customer portal functionality

## 5. Production Setup

### Step 1: Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live mode**
2. Create the same products and prices in live mode
3. Update the price IDs in your code with live price IDs

### Step 2: Update Environment Variables
```bash
# Replace with live keys
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

### Step 3: Update Webhook URL
- Update the webhook endpoint URL to your production domain
- Test the complete flow in production

## 6. Monitoring and Analytics

### Stripe Dashboard
- Monitor subscription metrics
- Track revenue and growth
- Manage failed payments and disputes

### Your App Analytics
- Use the admin dashboard to track usage patterns
- Monitor conversion rates from free to paid plans
- Analyze customer lifetime value

## 7. Troubleshooting

### Common Issues

#### Webhook Signature Verification Failed
- Verify webhook secret is correct
- Check that the endpoint is accessible
- Ensure request body is passed as raw text

#### Price ID Not Found
- Verify price IDs are copied correctly
- Ensure you're using the right environment (test vs live)
- Check that products are active in Stripe

#### User Plan Not Updated
- Check webhook logs in Stripe dashboard
- Verify Supabase permissions for service role
- Look for errors in your application logs

### Testing Commands
```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhooks

# Trigger specific events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated

# Test with Stripe CLI
stripe checkout sessions create \
  --success-url="https://yoursite.com/success" \
  --cancel-url="https://yoursite.com/cancel" \
  --line-items='[{"price": "price_YOUR_PRICE_ID", "quantity": 1}]' \
  --mode=subscription
```

## 8. Security Considerations

- Never expose your secret key in client-side code
- Always verify webhook signatures
- Use HTTPS for all webhook endpoints
- Implement proper error handling and logging
- Regular security audits of your payment flow

Your Stripe integration is now ready! 🎉





