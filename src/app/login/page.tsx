"use client";

import { 
  AppBar, 
  Box, 
  Button, 
  Container, 
  Stack, 
  Toolbar, 
  Typography,
  Paper,
  Card,
  CardContent
} from "@mui/material";
import { 
  Psychology as PsychologyIcon,
  Google as GoogleIcon,
  ArrowBack as ArrowBackIcon,
  Mic as MicIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function signInWithGoogle() {
    const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({ 
      provider: "google", 
      options: { redirectTo: `${window.location.origin}` } 
    });
  }

  const features = [
    {
      icon: <MicIcon sx={{ fontSize: 24, color: '#90caf9' }} />,
      text: "Natural voice conversations"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 24, color: '#4caf50' }} />,
      text: "Sub-second response time"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 24, color: '#9c27b0' }} />,
      text: "Secure & private"
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
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/')}
            sx={{ 
              textTransform: "none",
              color: "rgba(255, 255, 255, 0.8)",
              "&:hover": { 
                color: "#90caf9",
                background: "rgba(144, 202, 249, 0.1)"
              }
            }}
          >
            Back to Home
          </Button>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PsychologyIcon sx={{ color: '#90caf9', fontSize: 32 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              background: "linear-gradient(45deg, #90caf9, #64b5f6)", 
              backgroundClip: "text", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}>
              Jarvis AI
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={6} alignItems="center">
          {/* Header */}
          <Box textAlign="center">
            <Typography variant="h3" fontWeight={800} sx={{
              background: "linear-gradient(45deg, #90caf9, #64b5f6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2
            }}>
              Welcome to Jarvis
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
              Sign in to start having intelligent voice conversations with AI
            </Typography>
          </Box>

          {/* Login Card */}
          <Card sx={{ 
            maxWidth: 400,
            width: '100%',
            background: 'rgba(16, 21, 28, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(144, 202, 249, 0.2)',
          }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center">
                <PsychologyIcon sx={{ fontSize: 48, color: '#90caf9' }} />
                
                <Box textAlign="center">
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
                    Sign In
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Continue with your Google account
                  </Typography>
                </Box>

                {!envConfigured ? (
                  <Paper sx={{ 
                    p: 3, 
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    width: '100%'
                  }}>
                    <Typography color="error" variant="body2" textAlign="center">
                      ⚠️ Environment variables not configured. Please set up your Supabase credentials.
                    </Typography>
                  </Paper>
                ) : (
                  <Button 
                    variant="contained" 
                    size="large" 
                    fullWidth
                    startIcon={<GoogleIcon />}
                    onClick={signInWithGoogle}
                    sx={{ 
                      borderRadius: 3,
                      py: 1.5,
                      textTransform: "none",
                      fontSize: '1rem',
                      background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 16px rgba(144, 202, 249, 0.3)"
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    Continue with Google
                  </Button>
                )}

                <Typography variant="caption" color="text.secondary" textAlign="center">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Features */}
          <Box sx={{ width: '100%', maxWidth: 600 }}>
            <Typography variant="h6" textAlign="center" sx={{ mb: 3, fontWeight: 600 }}>
              What you'll get:
            </Typography>
            <Stack spacing={2}>
              {features.map((feature, index) => (
                <Paper key={index} sx={{ 
                  p: 2, 
                  background: 'rgba(16, 21, 28, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(144, 202, 249, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  {feature.icon}
                  <Typography variant="body1" fontWeight={500}>
                    {feature.text}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Box>

          {/* CTA */}
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              New to Jarvis?
            </Typography>
            <Button 
              onClick={() => router.push('/')}
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
              Learn more about Jarvis
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}


