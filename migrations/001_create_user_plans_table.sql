-- Create user plans table for subscription management
CREATE TABLE IF NOT EXISTS user_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'starter', 'pro', 'business'
  conversations_limit INTEGER NOT NULL DEFAULT 5,
  conversations_used INTEGER NOT NULL DEFAULT 0,
  max_conversation_minutes INTEGER DEFAULT 10,
  
  -- Stripe sync data
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT, -- which Stripe price they're on
  subscription_status TEXT DEFAULT 'active', -- 'active', 'trialing', 'past_due', 'canceled'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_stripe_customer_id ON user_plans(stripe_customer_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policy so users can only see their own plans
CREATE POLICY "Users can view their own plan" ON user_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own plan" ON user_plans FOR UPDATE USING (auth.uid() = user_id);

-- Allow service role to manage all plans (for Stripe webhooks)
CREATE POLICY "Service role can manage all plans" ON user_plans FOR ALL USING (auth.role() = 'service_role');



