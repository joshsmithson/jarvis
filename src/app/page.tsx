"use client";

import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import AuthGate from "@/components/AuthGate";
import UserMenu from "@/components/UserMenu";
import LandingPage from "@/components/LandingPage";
import UpgradeModal from "@/components/UpgradeModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsSignedIn(!!session);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsSignedIn(false);
    } finally {
      setLoading(false);
    }
  };


  function handleStartCall() {
    router.push("/call");
  }

  function handleViewHistory() {
    router.push("/history");
  }

  // Show loading state
  if (loading) {
    return null;
  }

  // Show landing page for unauthenticated users
  if (!isSignedIn) {
    return <LandingPage />;
  }

  // Show authenticated dashboard
  return (
    <AuthGate>
      <Box className="gradient-bg" sx={{ minHeight: "100vh" }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ 
          background: "rgba(16, 21, 28, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(144, 202, 249, 0.2)"
        }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              Jarvis AI
            </Typography>
                        <Stack direction="row" spacing={2}>
              <Button 
                onClick={() => router.push("/dashboard")} 
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  textTransform: "none",
                  borderColor: "rgba(144, 202, 249, 0.5)",
                  "&:hover": {
                    borderColor: "#90caf9",
                    background: "rgba(144, 202, 249, 0.1)"
                  }
                }}
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => setShowUpgradeModal(true)} 
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  textTransform: "none",
                  borderColor: "rgba(76, 175, 80, 0.5)",
                  color: "#4caf50",
                  "&:hover": {
                    borderColor: "#4caf50",
                    background: "rgba(76, 175, 80, 0.1)"
                  }
                }}
              >
                Upgrade
              </Button>
              <Button 
                onClick={handleStartCall} 
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
                Start Call
              </Button>
              <Button 
                onClick={handleViewHistory} 
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  textTransform: "none",
                  borderColor: "rgba(144, 202, 249, 0.5)",
                  "&:hover": {
                    borderColor: "#90caf9",
                    background: "rgba(144, 202, 249, 0.1)"
                  }
                }}
              >
                History
              </Button>
              <UserMenu />
            </Stack>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md">
          <Box py={8} display="flex" flexDirection="column" alignItems="center">
            <Box 
              className="glass-card-dark" 
              sx={{ 
                p: 6, 
                textAlign: "center", 
                maxWidth: 600,
                width: "100%"
              }}
            >
              <Typography variant="h3" fontWeight={800} gutterBottom sx={{
                background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 3
              }}>
                Welcome to Jarvis
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mb: 4, lineHeight: 1.6 }}
              >
                Experience the next generation of AI voice interaction. Start a real-time conversation with Jarvis or explore your conversation history.
              </Typography>
              <Stack direction="row" spacing={3} justifyContent="center">
                <Button 
                  onClick={handleStartCall}
                  variant="contained"
                  size="large"
                  sx={{ 
                    borderRadius: 4,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "1.1rem",
                    background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 24px rgba(144, 202, 249, 0.3)"
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  🎤 Start Conversation
                </Button>
                <Button 
                  onClick={handleViewHistory}
                  variant="outlined"
                  size="large"
                  sx={{ 
                    borderRadius: 4,
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontSize: "1.1rem",
                    borderColor: "rgba(144, 202, 249, 0.5)",
                    "&:hover": {
                      borderColor: "#90caf9",
                      background: "rgba(144, 202, 249, 0.1)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  📚 View History
                </Button>
              </Stack>
            </Box>
          </Box>
        </Container>

        {/* Upgrade Modal */}
        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan="free" // TODO: Get actual user plan
        />
      </Box>
    </AuthGate>
  );
}
