import Stripe from 'stripe';

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  appInfo: {
    name: 'Jarvis AI',
    version: '1.0.0',
  },
});

// Price IDs for your Stripe products
// TODO: Replace these with your actual Stripe price IDs after creating products
export const STRIPE_PRICES = {
  free: null, // Free plan doesn't need a price ID
  starter: 'price_1RyE4l0UVKdb3SF5DfdpPz6P', 
  pro: 'price_1RyE5H0UVKdb3SF5boIcrLWd', 
  business: 'price_1RyE5l0UVKdb3SF50hXZ5sra',
} as const;

// Plan configurations
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    conversations: 5,
    maxDuration: 10, // minutes
    features: ['Voice conversations', 'Basic AI model', 'Conversation history'],
  },
  starter: {
    name: 'Starter',
    price: 900, // £9.00 in pence
    conversations: 50,
    maxDuration: 30,
    features: ['Everything in Free', 'Priority processing', 'Extended conversations', 'Email support'],
  },
  pro: {
    name: 'Pro',
    price: 2900, // £29.00 in pence
    conversations: 200,
    maxDuration: 0, // unlimited
    features: ['Everything in Starter', 'Advanced AI model', 'Export conversations', 'Premium support'],
  },
  business: {
    name: 'Business',
    price: 9900, // £99.00 in pence
    conversations: 1000,
    maxDuration: 0, // unlimited
    features: ['Everything in Pro', 'Custom voice models', 'API access', 'Dedicated support'],
  },
} as const;

export type PlanType = keyof typeof PLANS;
