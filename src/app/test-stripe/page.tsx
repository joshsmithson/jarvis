"use client";

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Alert,
  Box,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';

interface UserPlan {
  user_id: string;
  plan_type: string;
  status: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

const plans = [
  { name: 'starter', price: '£9', color: '#4caf50' },
  { name: 'pro', price: '£29', color: '#ff9800' },
  { name: 'business', price: '£99', color: '#9c27b0' },
];

export default function StripeTestPage() {
  const [user, setUser] = useState<{id: string; email?: string} | null>(null);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setMessage({ type: 'error', text: 'Please log in first' });
        setLoading(false);
        return;
      }
      
      setUser(session.user);

      // Get user plan
      const { data: planData } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      setUserPlan(planData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'error', text: 'Failed to load user data' });
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    if (!user) return;
    
    setActionLoading(`upgrade-${plan}`);
    setMessage(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan,
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create checkout session' 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenPortal = async () => {
    if (!user) return;
    
    setActionLoading('portal');
    setMessage(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error opening portal:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to open customer portal' 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const refreshData = () => {
    setLoading(true);
    loadUserData();
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Please log in to test Stripe integration</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ 
        background: "linear-gradient(45deg, #90caf9, #64b5f6)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontWeight: 700,
        mb: 4
      }}>
        Stripe Integration Testing
      </Typography>

      {message && (
        <Alert 
          severity={message.type} 
          onClose={() => setMessage(null)}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      {/* Current Status */}
      <Card sx={{ mb: 4, background: 'rgba(255, 255, 255, 0.05)' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Current Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {user.id}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Current Plan
              </Typography>
              <Chip 
                label={userPlan?.plan_type || 'free'} 
                color={userPlan?.status === 'active' ? 'success' : 'default'}
                sx={{ mt: 0.5 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Subscription Status
              </Typography>
              <Chip 
                label={userPlan?.status || 'none'} 
                color={userPlan?.status === 'active' ? 'success' : 'warning'}
                sx={{ mt: 0.5 }}
              />
            </Grid>
            {userPlan?.stripe_customer_id && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Stripe Customer ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {userPlan.stripe_customer_id}
                </Typography>
              </Grid>
            )}
            {userPlan?.stripe_subscription_id && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Stripe Subscription ID
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {userPlan.stripe_subscription_id}
                </Typography>
              </Grid>
            )}
          </Grid>
          
          <Box mt={2}>
            <Button 
              variant="outlined" 
              onClick={refreshData}
              size="small"
            >
              Refresh Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Test Actions */}
      <Grid container spacing={3}>
        {/* Upgrade/Subscribe */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="h6" gutterBottom>
              Subscribe or Change Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test upgrading, downgrading, or initial subscription
            </Typography>
            
            <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
              {plans.map((plan) => (
                <Button
                  key={plan.name}
                  variant={userPlan?.plan_type === plan.name ? "contained" : "outlined"}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={actionLoading === `upgrade-${plan.name}` || userPlan?.plan_type === plan.name}
                  startIcon={actionLoading === `upgrade-${plan.name}` ? <CircularProgress size={16} /> : null}
                  sx={{
                    borderColor: plan.color,
                    color: plan.color,
                    '&:hover': {
                      borderColor: plan.color,
                      backgroundColor: `${plan.color}20`,
                    }
                  }}
                >
                  {userPlan?.plan_type === plan.name ? 'Current Plan' : `Subscribe to ${plan.name}`} ({plan.price})
                </Button>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Customer Portal */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="h6" gutterBottom>
              Stripe Customer Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test subscription management, payment methods, invoices, and cancellation
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleOpenPortal}
              disabled={!userPlan?.stripe_customer_id || actionLoading === 'portal'}
              startIcon={actionLoading === 'portal' ? <CircularProgress size={16} /> : null}
              sx={{
                background: 'linear-gradient(45deg, #90caf9, #64b5f6)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #64b5f6, #42a5f5)',
                }
              }}
            >
              Open Customer Portal
            </Button>

            {!userPlan?.stripe_customer_id && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Subscribe to a plan first to access the customer portal
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Test Instructions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255, 255, 255, 0.05)' }}>
            <Typography variant="h6" gutterBottom>
              Testing Instructions
            </Typography>
            <Typography variant="body2" component="div" sx={{ '& ol': { pl: 2 }, '& li': { mb: 1 } }}>
              <ol>
                <li><strong>Test Initial Subscription:</strong> Click any plan button above to create your first subscription</li>
                <li><strong>Test Plan Changes:</strong> Use different plan buttons to test upgrades/downgrades</li>
                <li><strong>Test Cancellation:</strong> Use &quot;Open Customer Portal&quot; → Cancel subscription</li>
                <li><strong>Test Payment Methods:</strong> Use Customer Portal to update payment methods</li>
                <li><strong>Test Failed Payments:</strong> Use test card <code>4000000000000341</code> (requires authentication, decline)</li>
                <li><strong>Monitor Webhooks:</strong> Watch your terminal running <code>stripe listen</code> for real-time events</li>
                <li><strong>Verify Database:</strong> Check user_plans table after each action using the refresh button</li>
              </ol>
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Stripe Test Cards:
            </Typography>
            <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
              • <strong>4242424242424242</strong> - Success<br/>
              • <strong>4000000000000341</strong> - Requires authentication (then fails)<br/>
              • <strong>4000000000000002</strong> - Generic decline<br/>
              • Use any future date for expiry, any 3-digit CVC
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

