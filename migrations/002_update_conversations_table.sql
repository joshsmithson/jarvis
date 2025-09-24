-- Add usage tracking columns to existing conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS estimated_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_cents INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS usage_metadata JSONB;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_created_at ON conversations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_duration ON conversations(duration_seconds);
CREATE INDEX IF NOT EXISTS idx_conversations_tokens ON conversations(estimated_tokens);

-- Add comments for documentation
COMMENT ON COLUMN conversations.duration_seconds IS 'Total conversation duration in seconds';
COMMENT ON COLUMN conversations.estimated_tokens IS 'Estimated token consumption for this conversation';
COMMENT ON COLUMN conversations.cost_cents IS 'Cost in pence/cents for this conversation';
COMMENT ON COLUMN conversations.usage_metadata IS 'Additional usage metadata from providers';



