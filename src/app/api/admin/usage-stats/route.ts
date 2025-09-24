import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const supabase = getSupabaseServerClient();

export async function GET() {
  try {
    // Basic security: check if user is authenticated
    // In a real app, you'd want proper admin role checking
    // const authHeader = request.headers.get('authorization');
    
    // Get all conversations with usage data
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select(`
        id,
        user_id,
        title,
        created_at,
        duration_seconds,
        estimated_tokens,
        cost_cents
      `)
      .order('created_at', { ascending: false });

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Get unique users count
    const { data: users, error: usersError } = await supabase
      .from('conversations')
      .select('user_id')
      .not('user_id', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const uniqueUsers = new Set(users?.map(u => u.user_id) || []).size;

    // Calculate aggregated statistics
    const totalConversations = conversations?.length || 0;
    const totalUsers = uniqueUsers;
    const totalDuration = conversations?.reduce((sum, conv) => sum + (conv.duration_seconds || 0), 0) || 0;
    const totalTokens = conversations?.reduce((sum, conv) => sum + (conv.estimated_tokens || 0), 0) || 0;
    const totalCost = conversations?.reduce((sum, conv) => sum + (conv.cost_cents || 0), 0) || 0;
    
    const averageConversationLength = totalConversations > 0 ? Math.round(totalDuration / totalConversations) : 0;
    const averageTokensPerConversation = totalConversations > 0 ? Math.round(totalTokens / totalConversations) : 0;

    const stats = {
      totalConversations,
      totalUsers,
      totalDuration,
      totalTokens,
      totalCost,
      averageConversationLength,
      averageTokensPerConversation,
      conversations: conversations || [],
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error generating usage stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



