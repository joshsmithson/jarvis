import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json({ error: 'user_id parameter required' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    // Get user plan
    const { data: userPlan, error } = await supabase
      .from('user_plans')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return NextResponse.json({
      user_id: userId,
      plan: userPlan || null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user plan:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch user plan',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

