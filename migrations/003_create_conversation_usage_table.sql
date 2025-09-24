-- Create detailed conversation usage tracking table
CREATE TABLE IF NOT EXISTS conversation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Timing data
  conversation_duration_seconds INTEGER NOT NULL,
  user_speech_duration_seconds INTEGER DEFAULT 0,
  ai_speech_duration_seconds INTEGER DEFAULT 0,
  
  -- Usage data
  estimated_tokens INTEGER DEFAULT 0,
  actual_tokens INTEGER, -- if we can get from provider
  cost_cents INTEGER DEFAULT 0,
  
  -- Provider metadata
  provider TEXT DEFAULT 'elevenlabs',
  provider_response_data JSONB, -- raw response for debugging
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_conversation_usage_user_id ON conversation_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_usage_conversation_id ON conversation_usage(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_usage_created_at ON conversation_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_usage_provider ON conversation_usage(provider);

-- Enable RLS
ALTER TABLE conversation_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own usage" ON conversation_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all usage" ON conversation_usage FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE conversation_usage IS 'Detailed usage tracking for each conversation';
COMMENT ON COLUMN conversation_usage.provider_response_data IS 'Raw response data from AI provider for debugging';



