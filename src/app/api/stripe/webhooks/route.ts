import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    if (!sig) {
      console.error('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          // Handle successful subscription creation
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;
          
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;
          const planType = getPlanFromPriceId(priceId);
          
          if (planType && session.client_reference_id) {
            // Update user's plan in Supabase
            const { error } = await supabase
              .from('user_plans')
              .upsert({
                user_id: session.client_reference_id,
                plan_type: planType,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: 'active',
                updated_at: new Date().toISOString()
              });

            if (error) {
              console.error('Error updating user plan:', error);
            } else {
              console.log(`Successfully upgraded user ${session.client_reference_id} to ${planType}`);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const planType = getPlanFromPriceId(priceId);
        
        if (planType) {
          // Update existing subscription
          const { error } = await supabase
            .from('user_plans')
            .update({
              plan_type: planType,
              status: subscription.status,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);

          if (error) {
            console.error('Error updating subscription:', error);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Downgrade user to free plan
        const { error } = await supabase
          .from('user_plans')
          .update({
            plan_type: 'free',
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error cancelling subscription:', error);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          // Mark subscription as past due
          const { error } = await supabase
            .from('user_plans')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription as string);

          if (error) {
            console.error('Error updating payment failed status:', error);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Helper function to map Stripe price IDs to plan types
function getPlanFromPriceId(priceId: string): string | null {
  const priceMap: Record<string, string> = {
    'price_1RyE4l0UVKdb3SF5DfdpPz6P': 'starter',
    'price_1RyE5H0UVKdb3SF5boIcrLWd': 'pro', 
    'price_1RyE5l0UVKdb3SF50hXZ5sra': 'business',
  };
  
  return priceMap[priceId] || null;
}