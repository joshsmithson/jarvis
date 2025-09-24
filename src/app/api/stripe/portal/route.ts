import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const supabase = getSupabaseServerClient();

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Get user's Stripe customer ID
    const { data: userPlan } = await supabase
      .from('user_plans')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single();

    if (!userPlan?.stripe_customer_id) {
      return NextResponse.json({ 
        error: 'No Stripe customer found. Please subscribe to a plan first.' 
      }, { status: 404 });
    }

    // Create portal session
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: userPlan.stripe_customer_id,
        return_url: `${request.headers.get('origin')}/settings`,
      });

      return NextResponse.json({ 
        url: session.url 
      });
    } catch (portalError: any) {
      if (portalError.code === 'billing_portal_configuration_missing') {
        return NextResponse.json({ 
          error: 'Customer portal not configured. Please set up your portal at https://dashboard.stripe.com/test/settings/billing/portal',
          needsSetup: true
        }, { status: 400 });
      }
      throw portalError;
    }

  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ 
      error: 'Failed to create portal session' 
    }, { status: 500 });
  }
}
