import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const supabase = getSupabaseServerClient();

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Get user's plan
    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', user_id)
      .single();

    // If no plan exists, create a free plan
    if (!userPlan) {
      const { data: newPlan, error: createError } = await supabase
        .from('user_plans')
        .insert([{
          user_id,
          plan_type: 'free',
          conversations_limit: 5,
          conversations_used: 0,
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user plan:', createError);
        return NextResponse.json({ error: 'Failed to create user plan' }, { status: 500 });
      }

      // Count existing conversations for this month
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', user_id)
        .gte('created_at', currentMonth.toISOString());

      const actualUsage = conversations?.length || 0;

      // Update the plan with actual usage
      await supabase
        .from('user_plans')
        .update({ conversations_used: actualUsage })
        .eq('user_id', user_id);

      return NextResponse.json({
        canStartConversation: actualUsage < 5,
        conversationsUsed: actualUsage,
        conversationsLimit: 5,
        planType: 'free',
        conversationsRemaining: Math.max(0, 5 - actualUsage)
      });
    }

    // Count conversations this month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', user_id)
      .gte('created_at', currentMonth.toISOString());

    const actualUsage = conversations?.length || 0;

    // Update the user's plan with actual usage
    if (actualUsage !== userPlan.conversations_used) {
      await supabase
        .from('user_plans')
        .update({ conversations_used: actualUsage })
        .eq('user_id', user_id);
    }

    const canStartConversation = actualUsage < userPlan.conversations_limit;
    const conversationsRemaining = Math.max(0, userPlan.conversations_limit - actualUsage);

    // Log usage event if user hits limit
    if (!canStartConversation) {
      await supabase
        .from('usage_events')
        .insert([{
          user_id,
          event_type: 'limit_hit',
          conversations_remaining: 0,
          plan_type: userPlan.plan_type,
          metadata: {
            limit_type: 'conversations',
            conversations_used: actualUsage,
            conversations_limit: userPlan.conversations_limit
          }
        }]);
    }

    return NextResponse.json({
      canStartConversation,
      conversationsUsed: actualUsage,
      conversationsLimit: userPlan.conversations_limit,
      planType: userPlan.plan_type,
      conversationsRemaining,
      upgradeRequired: !canStartConversation
    });

  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



