-- Function to automatically update user_plans.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on user_plans
CREATE TRIGGER update_user_plans_updated_at
    BEFORE UPDATE ON user_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to reset monthly usage counts
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_plans 
    SET 
        conversations_used = 0,
        current_period_start = NOW(),
        current_period_end = NOW() + INTERVAL '1 month'
    WHERE current_period_end < NOW();
END;
$$ language 'plpgsql';

-- Function to check and enforce usage limits
CREATE OR REPLACE FUNCTION check_conversation_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan RECORD;
    current_month_start DATE;
    conversations_this_month INTEGER;
BEGIN
    -- Get user's plan
    SELECT * INTO user_plan
    FROM user_plans
    WHERE user_id = p_user_id;
    
    -- If no plan exists, create a free plan
    IF NOT FOUND THEN
        INSERT INTO user_plans (user_id, plan_type, conversations_limit, conversations_used)
        VALUES (p_user_id, 'free', 5, 0)
        RETURNING * INTO user_plan;
    END IF;
    
    -- Count conversations this month
    current_month_start := DATE_TRUNC('month', NOW());
    SELECT COUNT(*) INTO conversations_this_month
    FROM conversations
    WHERE user_id = p_user_id 
    AND created_at >= current_month_start;
    
    -- Update the usage count
    UPDATE user_plans
    SET conversations_used = conversations_this_month
    WHERE user_id = p_user_id;
    
    -- Return whether user is within limits
    RETURN conversations_this_month < user_plan.conversations_limit;
END;
$$ language 'plpgsql';

-- Function to log usage events
CREATE OR REPLACE FUNCTION log_usage_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_conversation_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    user_plan RECORD;
BEGIN
    -- Get current user plan info
    SELECT * INTO user_plan
    FROM user_plans
    WHERE user_id = p_user_id;
    
    -- Insert usage event
    INSERT INTO usage_events (
        user_id,
        event_type,
        conversation_id,
        conversations_remaining,
        plan_type,
        metadata
    ) VALUES (
        p_user_id,
        p_event_type,
        p_conversation_id,
        COALESCE(user_plan.conversations_limit - user_plan.conversations_used, 0),
        COALESCE(user_plan.plan_type, 'free'),
        p_metadata
    );
END;
$$ language 'plpgsql';

-- Add comments
COMMENT ON FUNCTION reset_monthly_usage() IS 'Reset monthly usage counters for all users';
COMMENT ON FUNCTION check_conversation_limit(UUID) IS 'Check if user can start a new conversation within their plan limits';
COMMENT ON FUNCTION log_usage_event(UUID, TEXT, UUID, JSONB) IS 'Log usage events for analytics and monitoring';



