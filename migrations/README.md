# Database Migrations for Jarvis AI

This directory contains SQL migration files to set up the database schema for conversation tracking, usage limits, and billing integration.

## Migration Files

Run these migrations **in order** in your Supabase SQL editor:

### 1. `001_create_user_plans_table.sql`
Creates the `user_plans` table for managing user subscriptions and limits:
- Plan types (free, starter, pro, business)
- Conversation limits and usage tracking
- Stripe integration fields
- Row Level Security (RLS) policies

### 2. `002_update_conversations_table.sql`
Adds usage tracking columns to the existing `conversations` table:
- `duration_seconds` - conversation length
- `estimated_tokens` - token consumption
- `cost_cents` - cost in pence/cents
- `usage_metadata` - provider response data

### 3. `003_create_conversation_usage_table.sql`
Creates detailed usage tracking for analytics:
- Detailed timing breakdowns
- Token consumption tracking
- Provider response data storage
- RLS policies for user privacy

### 4. `004_create_usage_events_table.sql`
Creates event logging for user actions:
- Conversation starts/ends
- Limit enforcement events
- Plan changes
- Analytics and monitoring

### 5. `005_create_functions_and_triggers.sql`
Creates utility functions and triggers:
- Automatic `updated_at` timestamp updates
- Monthly usage reset function
- Usage limit checking function
- Usage event logging function

## How to Apply Migrations

1. **Open Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to "SQL Editor"

2. **Run Each Migration**
   - Copy the contents of each `.sql` file
   - Paste into the SQL editor
   - Run the migration
   - Repeat for all 5 files **in order**

3. **Verify Setup**
   ```sql
   -- Check tables were created
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   
   -- Check functions were created
   SELECT proname FROM pg_proc 
   WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
   ```

## Post-Migration Setup

After running migrations, you may want to:

1. **Create initial user plans** for existing users:
   ```sql
   INSERT INTO user_plans (user_id, plan_type, conversations_limit)
   SELECT id, 'free', 5
   FROM auth.users
   WHERE id NOT IN (SELECT user_id FROM user_plans);
   ```

2. **Set up a monthly cron job** to reset usage counters:
   ```sql
   -- This would typically be set up in your application or a separate cron job
   SELECT reset_monthly_usage();
   ```

## Schema Overview

```
auth.users (Supabase managed)
├── user_plans (subscription info)
├── conversations (enhanced with usage data)
│   └── conversation_usage (detailed analytics)
└── usage_events (action logging)
```

## Environment Variables Needed

Make sure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For Stripe integration (next steps)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Testing the Schema

You can test the schema with:

```sql
-- Test user plan creation
SELECT check_conversation_limit('test-user-id');

-- Test usage event logging
SELECT log_usage_event('test-user-id', 'conversation_start');

-- Test monthly reset (be careful in production!)
SELECT reset_monthly_usage();
```

## Next Steps

After applying these migrations:

1. ✅ Test the usage tracking in your app
2. ⏳ Set up Stripe products and prices
3. ⏳ Implement Stripe webhooks
4. ⏳ Add usage limit enforcement
5. ⏳ Create billing portal integration



