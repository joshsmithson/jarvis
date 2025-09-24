import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PRICES } from '@/lib/stripe';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const { plan, user_id } = await request.json();

    if (!plan || !user_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: plan and user_id' 
      }, { status: 400 });
    }

    if (plan === 'free') {
      return NextResponse.json({ 
        error: 'Cannot create checkout for free plan' 
      }, { status: 400 });
    }

    const priceId = STRIPE_PRICES[plan as keyof typeof STRIPE_PRICES];
    if (!priceId) {
      return NextResponse.json({ 
        error: `Invalid plan: ${plan}` 
      }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    
    // Check if user already has an active subscription
    const { data: existingPlan } = await supabase
      .from('user_plans')
      .select('stripe_customer_id, stripe_subscription_id, plan_type, status')
      .eq('user_id', user_id)
      .single();

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${origin}/dashboard?canceled=true`,
      client_reference_id: user_id,
      
      // If user already has a customer ID, use it
      ...(existingPlan?.stripe_customer_id && {
        customer: existingPlan.stripe_customer_id,
      }),
      
      // If they have an existing subscription, replace it
      ...(existingPlan?.stripe_subscription_id && {
        subscription_data: {
          metadata: {
            user_id: user_id,
            replacing_subscription: existingPlan.stripe_subscription_id,
          },
        },
      }),

      metadata: {
        user_id: user_id,
        plan: plan,
      },
    });

    return NextResponse.json({ 
      url: session.url,
      session_id: session.id 
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

