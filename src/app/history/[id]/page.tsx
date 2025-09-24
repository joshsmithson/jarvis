"use client";

import AuthGate from "@/components/AuthGate";
import UserMenu from "@/components/UserMenu";
import { AppBar, Box, Button, Container, IconButton, Stack, Toolbar, Typography, CircularProgress } from "@mui/material";
import { ArrowBack, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string;
  transcript?: string;
  created_at: string;
  audio_url?: string;
}

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${params.id}`);
        const data = await response.json();
        
        if (response.ok) {
          setConversation(data.conversation);
        } else {
          console.error('Failed to fetch conversation:', data.error);
        }
      } catch (error) {
        console.error('Failed to fetch conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchConversation();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!conversation || !confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const response = await fetch(`/api/conversations/${conversation.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/history');
      } else {
        alert('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation');
    }
  };

  const formatTranscript = (transcript: string) => {
    if (!transcript) return [];
    
    return transcript.split('\n').map((line, index) => {
      const [role, ...contentParts] = line.split(': ');
      const content = contentParts.join(': ');
      return { role, content, index };
    });
  };

  return (
    <AuthGate>
      <Box className="gradient-bg" sx={{ minHeight: "100vh" }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ 
          background: "rgba(16, 21, 28, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(144, 202, 249, 0.2)"
        }}>
          <Toolbar>
            <IconButton 
              onClick={() => router.push('/history')} 
              sx={{ 
                mr: 2,
                color: "#90caf9",
                "&:hover": {
                  background: "rgba(144, 202, 249, 0.1)"
                }
              }}
            >
              <ArrowBack />
            </IconButton>
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
            ) : conversation ? (
              <>
                <Box className="glass-card-dark" sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h4" fontWeight={800} gutterBottom sx={{
                        background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}>
                        {conversation.title}
                      </Typography>
                      <Typography color="text.secondary" variant="body1" sx={{ mb: 1 }}>
                        📅 {new Date(conversation.created_at).toLocaleDateString()} at{' '}
                        {new Date(conversation.created_at).toLocaleTimeString()}
                      </Typography>
                      {conversation.audio_url && (
                        <Typography color="text.secondary" variant="body1">
                          🎵 Audio recording available
                        </Typography>
                      )}
                    </Box>
                    <IconButton 
                      onClick={handleDelete} 
                      sx={{
                        color: "#f44336",
                        "&:hover": {
                          background: "rgba(244, 67, 54, 0.1)"
                        }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Stack>
                </Box>

                <Box className="glass-card-dark" sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                    💬 Conversation Transcript
                  </Typography>
                  {conversation.transcript ? (
                    <Stack spacing={3}>
                      {formatTranscript(conversation.transcript).map((message) => (
                        <Box 
                          key={message.index}
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: message.role === 'user' 
                              ? "rgba(144, 202, 249, 0.1)" 
                              : "rgba(255, 255, 255, 0.05)",
                            border: `1px solid ${message.role === 'user' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.8,
                              fontWeight: 600,
                              color: message.role === 'user' ? '#90caf9' : '#ffffff',
                              display: "block",
                              mb: 1
                            }}
                          >
                            {message.role === 'user' ? '👤 You' : '🤖 Jarvis'}
                          </Typography>
                          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                            {message.content}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Stack alignItems="center" spacing={2} py={4}>
                      <Typography variant="h6" color="text.secondary">
                        No transcript available
                      </Typography>
                      <Typography color="text.secondary" textAlign="center">
                        This conversation doesn&apos;t have a saved transcript.
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </>
            ) : (
              <Box className="glass-card-dark" sx={{ p: 6, textAlign: "center" }}>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  Conversation not found
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  The conversation you&apos;re looking for doesn&apos;t exist or has been deleted.
                </Typography>
                <Button 
                  onClick={() => router.push('/history')}
                  variant="contained"
                  sx={{ 
                    borderRadius: 3,
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
                  ← Back to History
                </Button>
              </Box>
            )}
          </Stack>
        </Container>
      </Box>
    </AuthGate>
  );
}



