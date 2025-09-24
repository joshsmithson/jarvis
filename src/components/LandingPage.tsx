"use client";

import { 
  AppBar, 
  Box, 
  Button, 
  Container, 
  Grid, 
  Stack, 
  Toolbar, 
  Typography,
  Card,
  CardContent,
  Chip,
  Paper,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import { 
  Mic as MicIcon,
  Psychology as PsychologyIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  Check as CheckIcon
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const signInWithGoogle = async () => {
    const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({ 
      provider: "google", 
      options: { redirectTo: `${window.location.origin}` } 
    });
  };

  const features = [
    {
      icon: <MicIcon sx={{ fontSize: 40, color: '#90caf9' }} />,
      title: "Natural Voice Conversations",
      description: "Have real-time voice conversations with Jarvis using advanced AI speech technology"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      title: "Sub-Second Response Time",
      description: "Experience lightning-fast responses with our optimized streaming architecture"
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      title: "Advanced AI Intelligence",
      description: "Powered by cutting-edge language models for intelligent, contextual conversations"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      title: "Secure & Private",
      description: "Your conversations are encrypted and stored securely with enterprise-grade security"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      rating: 5,
      comment: "Jarvis has transformed how I brainstorm ideas. The voice interface feels so natural!",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Software Engineer",
      rating: 5,
      comment: "The response time is incredible. It's like having a conversation with a real person.",
      avatar: "MJ"
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      rating: 5,
      comment: "I use Jarvis daily for content planning. The conversation history feature is brilliant.",
      avatar: "ER"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "£0",
      period: "forever",
      conversations: 5,
      maxDuration: "10 min",
      features: ["Voice conversations", "Basic AI model", "Conversation history"],
      popular: false,
      color: "#757575"
    },
    {
      name: "Starter",
      price: "£9",
      period: "month",
      conversations: 50,
      maxDuration: "30 min",
      features: ["Everything in Free", "Priority processing", "Extended conversations", "Email support"],
      popular: true,
      color: "#4caf50"
    },
    {
      name: "Pro",
      price: "£29",
      period: "month",
      conversations: 200,
      maxDuration: "Unlimited",
      features: ["Everything in Starter", "Advanced AI model", "Export conversations", "Premium support"],
      popular: false,
      color: "#ff9800"
    },
    {
      name: "Business",
      price: "£99",
      period: "month",
      conversations: 1000,
      maxDuration: "Unlimited",
      features: ["Everything in Pro", "Custom voice models", "API access", "Dedicated support"],
      popular: false,
      color: "#9c27b0"
    }
  ];

  const faqs = [
    {
      question: "How does the voice conversation work?",
      answer: "Jarvis uses advanced speech-to-text and text-to-speech technology to enable real-time voice conversations. Simply speak into your microphone and Jarvis will respond with natural-sounding speech."
    },
    {
      question: "Is my conversation data secure?",
      answer: "Yes! All conversations are encrypted in transit and at rest. We use enterprise-grade security measures and never share your data with third parties."
    },
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Absolutely! You can change your plan at any time. Upgrades take effect immediately, while downgrades apply at the next billing cycle."
    },
    {
      question: "What happens if I exceed my conversation limit?",
      answer: "You'll receive a notification when you're approaching your limit. If you exceed it, you'll be prompted to upgrade your plan to continue using Jarvis."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied, contact support for a full refund."
    }
  ];

  return (
    <Box className="gradient-bg" sx={{ minHeight: "100vh" }}>
      {/* Navigation */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ 
        background: "rgba(16, 21, 28, 0.8)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(144, 202, 249, 0.2)"
      }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PsychologyIcon sx={{ color: '#90caf9', fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, background: "linear-gradient(45deg, #90caf9, #64b5f6)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Jarvis AI
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={2}>
            <Button 
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              sx={{ 
                textTransform: "none",
                color: "rgba(255, 255, 255, 0.8)",
                "&:hover": { color: "#90caf9" }
              }}
            >
              Pricing
            </Button>
            <Button 
              onClick={() => router.push('/login')}
              variant="outlined"
              sx={{ 
                borderRadius: 3,
                textTransform: "none",
                borderColor: "rgba(144, 202, 249, 0.5)",
                color: "#90caf9",
                "&:hover": {
                  borderColor: "#90caf9",
                  background: "rgba(144, 202, 249, 0.1)"
                }
              }}
            >
              Sign In
            </Button>
            <Button 
              onClick={signInWithGoogle}
              variant="contained"
              sx={{ 
                borderRadius: 3,
                textTransform: "none",
                background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                "&:hover": {
                  background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                }
              }}
            >
              Get Started Free
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
          <Typography variant="h2" fontWeight={800} sx={{
            background: "linear-gradient(45deg, #90caf9, #64b5f6)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 3,
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}>
            Talk to Jarvis
          </Typography>
          
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Experience the future of AI conversation with real-time voice interactions. 
            Natural, intelligent, and lightning-fast.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 6 }}>
            <Button 
              onClick={signInWithGoogle}
              variant="contained" 
              size="large"
              startIcon={<PlayIcon />}
              sx={{ 
                borderRadius: 4,
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                "&:hover": {
                  background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 24px rgba(144, 202, 249, 0.3)"
                },
                transition: "all 0.3s ease"
              }}
            >
              Try Jarvis Free
            </Button>
            <Button 
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outlined" 
              size="large"
              sx={{ 
                borderRadius: 4,
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                borderColor: "rgba(144, 202, 249, 0.5)",
                color: "#90caf9",
                "&:hover": {
                  borderColor: "#90caf9",
                  background: "rgba(144, 202, 249, 0.1)",
                  transform: "translateY(-2px)"
                },
                transition: "all 0.3s ease"
              }}
            >
              Watch Demo
            </Button>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Chip label="✨ No setup required" variant="outlined" sx={{ borderColor: 'rgba(144, 202, 249, 0.5)', color: '#90caf9' }} />
            <Chip label="🚀 Sub-second responses" variant="outlined" sx={{ borderColor: 'rgba(76, 175, 80, 0.5)', color: '#4caf50' }} />
            <Chip label="🔒 Enterprise security" variant="outlined" sx={{ borderColor: 'rgba(156, 39, 176, 0.5)', color: '#9c27b0' }} />
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" textAlign="center" fontWeight={700} sx={{ mb: 6 }}>
            Why Choose Jarvis?
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%',
                  background: 'rgba(16, 21, 28, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(144, 202, 249, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: 'rgba(144, 202, 249, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Testimonials */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" textAlign="center" fontWeight={700} sx={{ mb: 6 }}>
            What Users Say
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper sx={{ 
                  p: 3,
                  background: 'rgba(16, 21, 28, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(144, 202, 249, 0.2)',
                  height: '100%'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ 
                      background: 'linear-gradient(45deg, #90caf9, #64b5f6)',
                      fontWeight: 600 
                    }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    "{testimonial.comment}"
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Pricing Section */}
        <Box id="pricing" sx={{ py: 8 }}>
          <Typography variant="h3" textAlign="center" fontWeight={700} sx={{ mb: 2 }}>
            Choose Your Plan
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Start free, upgrade when you need more conversations
          </Typography>
          
          <Grid container spacing={3} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%',
                  background: plan.popular ? 'linear-gradient(145deg, rgba(76, 175, 80, 0.1), rgba(16, 21, 28, 0.9))' : 'rgba(16, 21, 28, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: plan.popular ? '2px solid #4caf50' : '1px solid rgba(144, 202, 249, 0.2)',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    borderColor: plan.popular ? '#4caf50' : 'rgba(144, 202, 249, 0.4)',
                  },
                  transition: 'all 0.3s ease'
                }}>
                  {plan.popular && (
                    <Chip 
                      label="Most Popular" 
                      sx={{ 
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        fontWeight: 600
                      }} 
                    />
                  )}
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                      {plan.name}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h3" fontWeight={700} component="span" sx={{ color: plan.color }}>
                        {plan.price}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" component="span">
                        /{plan.period}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                        {plan.conversations} conversations
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Max {plan.maxDuration} per conversation
                      </Typography>
                    </Box>

                    <Stack spacing={1} sx={{ mb: 3 }}>
                      {plan.features.map((feature, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Stack>

                    <Button 
                      onClick={signInWithGoogle}
                      variant={plan.popular ? "contained" : "outlined"}
                      fullWidth
                      sx={{
                        borderRadius: 3,
                        textTransform: "none",
                        py: 1.5,
                        ...(plan.popular ? {
                          background: "linear-gradient(45deg, #4caf50, #45a049)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #45a049, #3d8b40)",
                          }
                        } : {
                          borderColor: "rgba(144, 202, 249, 0.5)",
                          color: "#90caf9",
                          "&:hover": {
                            borderColor: "#90caf9",
                            background: "rgba(144, 202, 249, 0.1)"
                          }
                        })
                      }}
                    >
                      {plan.name === 'Free' ? 'Start Free' : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" textAlign="center" fontWeight={700} sx={{ mb: 6 }}>
            Frequently Asked Questions
          </Typography>
          
          <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {faqs.map((faq, index) => (
              <Accordion 
                key={index}
                sx={{ 
                  background: 'rgba(16, 21, 28, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(144, 202, 249, 0.2)',
                  mb: 1,
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
            Ready to Talk to Jarvis?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Join thousands of users having intelligent voice conversations with AI
          </Typography>
          <Button 
            onClick={signInWithGoogle}
            variant="contained" 
            size="large"
            startIcon={<MicIcon />}
            sx={{ 
              borderRadius: 4,
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              background: "linear-gradient(45deg, #90caf9, #64b5f6)",
              "&:hover": {
                background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                transform: "translateY(-2px)",
                boxShadow: "0 12px 24px rgba(144, 202, 249, 0.3)"
              },
              transition: "all 0.3s ease"
            }}
          >
            Start Your First Conversation
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ 
        borderTop: '1px solid rgba(144, 202, 249, 0.2)',
        py: 4,
        background: 'rgba(16, 21, 28, 0.9)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 Jarvis AI. All rights reserved. Built with ❤️ for the future of conversation.
            </Typography>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
