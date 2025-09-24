"use client";

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { Check, Star, Rocket } from '@mui/icons-material';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  conversations: number;
  maxDuration: string;
  features: string[];
  current: boolean;
  popular: boolean;
  color: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onClose, currentPlan = 'free' }) => {
  const plans = [
    {
      name: 'Free',
      price: '£0',
      period: 'forever',
      conversations: 5,
      maxDuration: '10 min',
      features: [
        'Voice conversations',
        'Basic AI model',
        'Conversation history'
      ],
      current: currentPlan === 'free',
      popular: false,
      color: '#757575'
    },
    {
      name: 'Starter',
      price: '£9',
      period: 'month',
      conversations: 50,
      maxDuration: '30 min',
      features: [
        'Everything in Free',
        'Priority processing',
        'Extended conversations',
        'Email support'
      ],
      current: currentPlan === 'starter',
      popular: true,
      color: '#4caf50'
    },
    {
      name: 'Pro',
      price: '£29',
      period: 'month',
      conversations: 200,
      maxDuration: 'Unlimited',
      features: [
        'Everything in Starter',
        'Advanced AI model',
        'Export conversations',
        'Premium support'
      ],
      current: currentPlan === 'pro',
      popular: false,
      color: '#ff9800'
    },
    {
      name: 'Business',
      price: '£99',
      period: 'month',
      conversations: 1000,
      maxDuration: 'Unlimited',
      features: [
        'Everything in Pro',
        'Custom voice models',
        'API access',
        'Dedicated support'
      ],
      current: currentPlan === 'business',
      popular: false,
      color: '#9c27b0'
    }
  ];

  const handleUpgrade = async (planName: string) => {
    try {
      // Get current user
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.error('User not authenticated');
        return;
      }

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planName.toLowerCase(),
          user_id: session.user.id,
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
      // You might want to show an error message to the user here
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(16, 21, 28, 0.95) 0%, rgba(30, 40, 50, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(144, 202, 249, 0.2)'
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" fontWeight={700} sx={{
          background: "linear-gradient(45deg, #90caf9, #64b5f6)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Upgrade Your Plan
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Choose the perfect plan for your AI conversation needs
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              sx={{
                position: 'relative',
                background: plan.current 
                  ? 'linear-gradient(135deg, rgba(144, 202, 249, 0.1) 0%, rgba(100, 181, 246, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: plan.popular 
                  ? '2px solid #90caf9' 
                  : plan.current 
                  ? '2px solid #4caf50'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 3,
                overflow: 'visible'
              }}
            >
              {plan.popular && (
                <Chip
                  label="Most Popular"
                  icon={<Star />}
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(45deg, #90caf9, #64b5f6)',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              )}
              
              {plan.current && (
                <Chip
                  label="Current Plan"
                  sx={{
                    position: 'absolute',
                    top: -12,
                    right: 16,
                    background: '#4caf50',
                    color: 'white',
                    fontWeight: 600
                  }}
                />
              )}

              <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                      {plan.name}
                    </Typography>
                    <Box display="flex" alignItems="baseline" gap={1} mb={1}>
                      <Typography variant="h3" fontWeight={800} color="primary">
                        {plan.price}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        /{plan.period}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {plan.conversations} conversations/month
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Max duration: {plan.maxDuration}
                    </Typography>
                  </Box>
                  
                  {!plan.current && (
                    <Button
                      variant={plan.popular ? "contained" : "outlined"}
                      size="large"
                      onClick={() => handleUpgrade(plan.name)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3,
                        ...(plan.popular && {
                          background: 'linear-gradient(45deg, #90caf9, #64b5f6)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #64b5f6, #42a5f5)',
                          }
                        })
                      }}
                      startIcon={<Rocket />}
                    >
                      {plan.name === 'Business' ? 'Contact Sales' : 'Upgrade'}
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                <List dense>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Check color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpgradeModal;
