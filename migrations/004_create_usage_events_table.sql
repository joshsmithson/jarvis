-- Create usage events table for tracking user actions and limits
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'conversation_start', 'conversation_end', 'limit_hit', 'upgrade', 'downgrade'
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Context data
  conversations_remaining INTEGER,
  plan_type TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_event_type ON usage_events(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_events_created_at ON usage_events(created_at DESC);

-- Enable RLS
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own events" ON usage_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all events" ON usage_events FOR ALL USING (auth.role() = 'service_role');

-- Add comments
COMMENT ON TABLE usage_events IS 'Track user actions and usage patterns for analytics';
COMMENT ON COLUMN usage_events.event_type IS 'Type of event: conversation_start, conversation_end, limit_hit, upgrade, etc.';
COMMENT ON COLUMN usage_events.metadata IS 'Additional context data for the event';



