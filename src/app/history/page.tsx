"use client";

import AuthGate from "@/components/AuthGate";
import UserMenu from "@/components/UserMenu";
import Link from "next/link";
import { AppBar, Box, Container, List, ListItem, ListItemButton, ListItemText, Stack, Toolbar, Typography, Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  transcript?: string;
  audio_url?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const response = await fetch(`/api/conversations?user_id=${user.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

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
                onClick={() => router.push("/")}
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
                Home
              </Button>
              <Button 
                onClick={() => router.push("/call")}
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
              <UserMenu />
            </Stack>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md">
          <Stack spacing={4} mt={6}>
            <Typography variant="h4" fontWeight={800} sx={{
              background: "linear-gradient(45deg, #90caf9, #64b5f6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center"
            }}>
              📚 Conversation History
            </Typography>
            
            {loading ? (
              <Box 
                className="glass-card-dark"
                sx={{ 
                  p: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <CircularProgress sx={{ color: "#90caf9" }} />
              </Box>
            ) : (
              <Box className="glass-card-dark" sx={{ p: 4 }}>
                {conversations.length === 0 ? (
                  <Stack alignItems="center" spacing={3} py={4}>
                    <Typography variant="h6" color="text.secondary" textAlign="center">
                      No conversations yet
                    </Typography>
                    <Typography color="text.secondary" textAlign="center">
                      Start your first conversation with Jarvis to see your chat history here!
                    </Typography>
                    <Button 
                      onClick={() => router.push("/call")}
                      variant="contained"
                      size="large"
                      sx={{ 
                        borderRadius: 4,
                        px: 4,
                        py: 1.5,
                        textTransform: "none",
                        background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                        "&:hover": {
                          background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 12px 24px rgba(144, 202, 249, 0.3)"
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      🎤 Start Your First Call
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Your Conversations ({conversations.length})
                    </Typography>
                    {conversations.map((c) => (
                      <Box 
                        key={c.id}
                        onClick={() => router.push(`/history/${c.id}`)}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: "rgba(144, 202, 249, 0.1)",
                          border: "1px solid rgba(144, 202, 249, 0.2)",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "rgba(144, 202, 249, 0.2)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 24px rgba(144, 202, 249, 0.2)"
                          }
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ color: "#90caf9", fontWeight: 600 }}>
                          {c.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          📅 {new Date(c.created_at).toLocaleDateString()} at {new Date(c.created_at).toLocaleTimeString()}
                        </Typography>
                        {c.transcript && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                            💬 Has transcript
                          </Typography>
                        )}
                        {c.audio_url && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                            🎵 Audio available
                          </Typography>
                        )}
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            )}
          </Stack>
        </Container>
      </Box>
    </AuthGate>
  );
}


