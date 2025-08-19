"use client";

import AuthGate from "@/components/AuthGate";
import { AppBar, Box, Button, Container, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { useConversation } from "@elevenlabs/react";
import { useCallback, useRef, useState } from "react";

export default function CallPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const conversationTitleRef = useRef<string>("");

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Jarvis");
      setStartTime(new Date());
      setMessages([]);
    },
    onDisconnect: () => {
      console.log("Disconnected from Jarvis");
      saveConversation();
    },
    onMessage: (message) => {
      console.log("Message:", message);
      // ElevenLabs message format might vary, adapt as needed
      if (message.type === 'user_transcript') {
        setMessages(prev => [...prev, { 
          role: 'user', 
          content: message.content || message.text || '', 
          timestamp: new Date() 
        }]);
        // Use first user message as conversation title
        if (!conversationTitleRef.current && message.content) {
          conversationTitleRef.current = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
        }
      } else if (message.type === 'agent_response') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: message.content || message.text || '', 
          timestamp: new Date() 
        }]);
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      // Don't throw the error, just log it
    },
    onDebug: (debugInfo) => {
      // Add debug callback to prevent undefined function errors
      console.log("Debug:", debugInfo);
    },
    // Add additional error handling options
    onModeChange: (mode) => {
      console.log("Mode changed:", mode);
    },
    onStatusChange: (status) => {
      console.log("Status changed:", status);
    },
  });

  const saveConversation = useCallback(async () => {
    if (messages.length === 0 || !startTime) return;

    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const title = conversationTitleRef.current || `Conversation on ${new Date().toLocaleDateString()}`;
      const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');

      await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title,
          transcript,
          started_at: startTime.toISOString(),
          ended_at: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [messages, startTime]);

  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "agent_7501k2msdrq5e6rs31xb2yw14eyk",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert("Microphone permission denied. Please allow microphone access and try again.");
        } else if (error.name === 'NotFoundError') {
          alert("No microphone found. Please check your audio devices.");
        } else {
          alert(`Failed to start conversation: ${error.message}`);
        }
      } else {
        alert("Failed to start conversation. Please try again.");
      }
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (error) {
      console.error("Error ending conversation:", error);
      // Force cleanup if endSession fails
      setMessages([]);
      setStartTime(null);
      conversationTitleRef.current = "";
    }
  }, [conversation]);

  // Audio visualization component
  const AudioVisualizer = ({ isActive }: { isActive: boolean }) => (
    <Box className="audio-visualizer">
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          className="audio-bar"
          sx={{
            height: isActive ? "auto" : "20px",
            animationPlayState: isActive ? "running" : "paused",
          }}
        />
      ))}
    </Box>
  );

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
                href="/" 
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
                href="/history" 
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
              <Button 
                onClick={async () => {
                  const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
                  const supabase = getSupabaseBrowserClient();
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                sx={{ 
                  borderRadius: 3,
                  textTransform: "none",
                  color: "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)"
                  }
                }}
              >
                Sign out
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
        <Container maxWidth="sm">
          <Stack spacing={4} alignItems="center" mt={6}>
            <Typography variant="h4" fontWeight={800} sx={{
              background: "linear-gradient(45deg, #90caf9, #64b5f6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center"
            }}>
              Talk to Jarvis
            </Typography>
            
            <Box 
              className={`glass-card-dark ${conversation.isSpeaking ? 'speaking-pulse' : ''}`}
              sx={{ 
                width: "100%", 
                minHeight: 320, 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                flexDirection: "column", 
                gap: 3,
                p: 4,
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Status indicator */}
              <Box
                sx={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: conversation.status === "connected" ? "#4caf50" : 
                                   conversation.status === "connecting" ? "#ff9800" : "#757575",
                    animation: conversation.status === "connecting" ? "pulse 1s infinite" : "none"
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  {conversation.status}
                </Typography>
              </Box>

              {/* Main content area */}
              <Box textAlign="center" sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {conversation.status === "connected" 
                    ? conversation.isSpeaking 
                      ? "🗣️ Jarvis is speaking..." 
                      : "👂 Listening... speak now"
                    : "🎤 Ready to connect"
                  }
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {conversation.status === "connected" 
                    ? "Having a conversation with Jarvis AI"
                    : "Click the button below to start your conversation"
                  }
                </Typography>
              </Box>

              {/* Audio visualizer */}
              {conversation.status === "connected" && (
                <Box sx={{ my: 3 }}>
                  <AudioVisualizer isActive={conversation.isSpeaking || conversation.status === "connected"} />
                </Box>
              )}

              {/* Connection button */}
              <Box sx={{ mt: "auto" }}>
                {conversation.status !== "connected" ? (
                  <Button 
                    onClick={startConversation} 
                    disabled={conversation.status === "connecting"} 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      borderRadius: 4,
                      px: 6,
                      py: 2,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #64b5f6, #42a5f5)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 24px rgba(144, 202, 249, 0.3)"
                      },
                      "&:disabled": {
                        background: "rgba(144, 202, 249, 0.3)",
                        transform: "none",
                        boxShadow: "none"
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    {conversation.status === "connecting" ? "🔄 Connecting..." : "🎤 Start Conversation"}
                  </Button>
                ) : (
                  <Button 
                    color="error" 
                    onClick={stopConversation} 
                    variant="contained" 
                    size="large"
                    sx={{ 
                      borderRadius: 4,
                      px: 6,
                      py: 2,
                      textTransform: "none",
                      fontSize: "1.1rem",
                      background: "linear-gradient(45deg, #f44336, #e53935)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #e53935, #d32f2f)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 24px rgba(244, 67, 54, 0.3)"
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    🛑 End Conversation
                  </Button>
                )}
              </Box>
            </Box>

            {/* Conversation messages preview */}
            {messages.length > 0 && (
              <Box 
                className="glass-card-dark"
                sx={{ 
                  width: "100%", 
                  maxHeight: 200, 
                  overflow: "auto",
                  p: 3
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  Conversation Preview
                </Typography>
                <Stack spacing={1}>
                  {messages.slice(-3).map((message, index) => (
                    <Box key={index} sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      background: message.role === 'user' 
                        ? "rgba(144, 202, 249, 0.1)" 
                        : "rgba(255, 255, 255, 0.05)" 
                    }}>
                      <Typography variant="caption" color="text.secondary">
                        {message.role === 'user' ? 'You' : 'Jarvis'}:
                      </Typography>
                      <Typography variant="body2">
                        {message.content}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Container>
      </Box>
    </AuthGate>
  );
}


