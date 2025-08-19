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

  return (
    <AuthGate>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Jarvis
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button href="/" variant="outlined">Home</Button>
            <Button href="/history" variant="outlined">History</Button>
            <Button onClick={async () => {
              const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
              const supabase = getSupabaseBrowserClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}>Sign out</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center" mt={6}>
          <Typography variant="h5" fontWeight={700}>
            Real-time Call with Jarvis
          </Typography>
          <Paper variant="outlined" sx={{ width: "100%", height: 240, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 2 }}>
            <Typography color="text.secondary">
              Status: {conversation.status}
            </Typography>
            <Typography color="text.secondary">
              {conversation.status === "connected" 
                ? conversation.isSpeaking 
                  ? "Jarvis is speaking..." 
                  : "Listening... speak to Jarvis"
                : "Click Start to begin conversation"
              }
            </Typography>
          </Paper>
          <Box>
            {conversation.status !== "connected" ? (
              <Button 
                onClick={startConversation} 
                disabled={conversation.status === "connecting"} 
                variant="contained" 
                size="large"
              >
                {conversation.status === "connecting" ? "Connecting..." : "Start Conversation"}
              </Button>
            ) : (
              <Button 
                color="error" 
                onClick={stopConversation} 
                variant="contained" 
                size="large"
              >
                End Conversation
              </Button>
            )}
          </Box>
        </Stack>
      </Container>
    </AuthGate>
  );
}


