import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const supabase = getSupabaseServerClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Get user plan information (with defaults for users not in user_plans table)
    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // Default plan if user doesn't have a plan record yet
    const planInfo = userPlan || {
      plan_type: 'free',
      conversations_limit: 5,
      conversations_used: 0,
    };

    // Get user's conversations for this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        duration_seconds,
        estimated_tokens,
        cost_cents
      `)
      .eq('user_id', user_id)
      .gte('created_at', currentMonth.toISOString())
      .order('created_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Calculate aggregated statistics
    const conversationsThisMonth = conversations || [];
    const totalDuration = conversationsThisMonth.reduce((sum, conv) => sum + (conv.duration_seconds || 0), 0);
    const totalTokens = conversationsThisMonth.reduce((sum, conv) => sum + (conv.estimated_tokens || 0), 0);
    const totalCost = conversationsThisMonth.reduce((sum, conv) => sum + (conv.cost_cents || 0), 0);

    // If user doesn't have a plan record, update their usage count
    const actualConversationsUsed = conversationsThisMonth.length;
    
    // Update conversations_used in user_plans if it exists
    if (userPlan && actualConversationsUsed !== userPlan.conversations_used) {
      await supabase
        .from('user_plans')
        .update({ conversations_used: actualConversationsUsed })
        .eq('user_id', user_id);
    }

    const usage = {
      conversations_used: actualConversationsUsed,
      conversations_limit: planInfo.conversations_limit,
      plan_type: planInfo.plan_type,
      total_duration: totalDuration,
      total_tokens: totalTokens,
      total_cost: totalCost,
      recent_conversations: conversationsThisMonth.slice(0, 10),
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



