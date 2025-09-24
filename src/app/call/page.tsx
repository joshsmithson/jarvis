"use client";

import AuthGate from "@/components/AuthGate";
import DebugPanel from "@/components/DebugPanel";
import UserMenu from "@/components/UserMenu";
import UsageLimitModal from "@/components/UsageLimitModal";
import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import { useConversation } from "@elevenlabs/react";
import { useCallback, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useConversationTracking } from "@/hooks/useConversationTracking";

export default function CallPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const conversationTitleRef = useRef<string>("");
  const messagesRef = useRef<Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>>([]);
  const startTimeRef = useRef<Date | null>(null);

  // Usage limit tracking
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageInfo, setUsageInfo] = useState<{
    conversationsUsed: number;
    conversationsLimit: number;
    planType: string;
    canStartConversation: boolean;
  } | null>(null);

  // Usage tracking
  const {
    isDebugMode,
    setIsDebugMode,
    currentMetrics,
    startConversation: startTracking,
    endConversation: endTracking,
    handleMessage: trackMessage,
    updateRealTimeMetrics,
    getEstimatedCost,
  } = useConversationTracking();

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to Jarvis");
      const now = new Date();
      setStartTime(now);
      setMessages([]);
      startTimeRef.current = now;
      messagesRef.current = [];
      // Start usage tracking
      startTracking();
    },
    onDisconnect: () => {
      console.log("Disconnected from Jarvis");
      console.log("Messages at disconnect:", messages);
      console.log("StartTime at disconnect:", startTime);
      console.log("Messages ref at disconnect:", messagesRef.current);
      console.log("StartTime ref at disconnect:", startTimeRef.current);
      
      // End usage tracking and get final metrics
      const finalMetrics = endTracking();
      
      // Use ref-based save to avoid stale closure issues
      saveConversationFromRefs(finalMetrics);
    },
    onMessage: (message: {
      source?: 'user' | 'ai';
      message?: string;
      content?: string;
      text?: string;
      type?: string;
    }) => {
      console.log("Message:", message);
      
      // Handle the actual ElevenLabs message format
      if (message.source === 'user') {
        const content = message.message || message.content || message.text || '';
        const newMessage = { role: 'user' as const, content, timestamp: new Date() };
        setMessages(prev => {
          const updated = [...prev, newMessage];
          messagesRef.current = updated; // Keep ref in sync
          return updated;
        });
        // Track the message for usage
        trackMessage(message, true);
        // Use first user message as conversation title
        if (!conversationTitleRef.current && content) {
          conversationTitleRef.current = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        }
        console.log("Added user message:", content);
      } else if (message.source === 'ai') {
        const content = message.message || message.content || message.text || '';
        const newMessage = { role: 'assistant' as const, content, timestamp: new Date() };
        setMessages(prev => {
          const updated = [...prev, newMessage];
          messagesRef.current = updated; // Keep ref in sync
          return updated;
        });
        // Track the message for usage
        trackMessage(message, false);
        console.log("Added AI message:", content);
      }
      
      // Legacy format support (in case the format changes)
      else if (message.type === 'user_transcript') {
        const content = message.content || message.text || '';
        const newMessage = { role: 'user' as const, content, timestamp: new Date() };
        setMessages(prev => {
          const updated = [...prev, newMessage];
          messagesRef.current = updated;
          return updated;
        });
        if (!conversationTitleRef.current && content) {
          conversationTitleRef.current = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        }
      } else if (message.type === 'agent_response') {
        const content = message.content || message.text || '';
        const newMessage = { role: 'assistant' as const, content, timestamp: new Date() };
        setMessages(prev => {
          const updated = [...prev, newMessage];
          messagesRef.current = updated;
          return updated;
        });
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

  // Update metrics every second during conversation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (conversation.status === "connected") {
      interval = setInterval(updateRealTimeMetrics, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [conversation.status, updateRealTimeMetrics]);

  // Check usage limits
  const checkUsageLimits = useCallback(async (): Promise<boolean> => {
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const response = await fetch('/api/usage/check-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsageInfo(data);
        
        if (!data.canStartConversation) {
          setShowUsageModal(true);
          return false;
        }
        
        // Show warning if close to limit (80%+)
        const usagePercentage = (data.conversationsUsed / data.conversationsLimit) * 100;
        if (usagePercentage >= 80) {
          setShowUsageModal(true);
          return true; // Allow conversation but show warning
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking usage limits:', error);
      return true; // Allow conversation if check fails
    }
  }, []);

  // Create a ref-based save function that doesn't depend on state
  const saveConversationFromRefs = useCallback(async (metrics?: {
    duration_seconds: number;
    estimated_tokens: number;
    user_speech_duration: number;
    ai_speech_duration: number;
    message_count: number;
    user_message_count: number;
    ai_message_count: number;
  }) => {
    console.log('saveConversationFromRefs called');
    console.log('Messages from ref:', messagesRef.current);
    console.log('StartTime from ref:', startTimeRef.current);

    if (messagesRef.current.length === 0 || !startTimeRef.current) {
      console.log('Skipping save: no messages or start time in refs');
      return;
    }

    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found, skipping save');
        return;
      }

      const title = conversationTitleRef.current || `Conversation on ${new Date().toLocaleDateString()}`;
      const transcript = messagesRef.current.map(m => `${m.role}: ${m.content}`).join('\n');
      
      // Calculate estimated cost
      const estimatedCostPounds = metrics ? getEstimatedCost(metrics) : 0;
      const costCents = Math.round(estimatedCostPounds * 100); // Convert to pence

      console.log('Saving conversation from refs:', { title, transcript, user_id: user.id, metrics });

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title,
          transcript,
          duration_seconds: metrics?.duration_seconds || 0,
          estimated_tokens: metrics?.estimated_tokens || 0,
          cost_cents: costCents,
          usage_metadata: metrics ? {
            user_speech_duration: metrics.user_speech_duration,
            ai_speech_duration: metrics.ai_speech_duration,
            message_count: metrics.message_count,
            user_message_count: metrics.user_message_count,
            ai_message_count: metrics.ai_message_count,
            raw_data: metrics,
          } : null,
          // audio_url can be added later if you implement audio recording
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Conversation saved successfully:', result);
      } else {
        console.error('Failed to save conversation:', result);
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [getEstimatedCost]);

  // Keep the original save function for manual saves (uses current state)
  const saveConversation = useCallback(async () => {
    console.log('saveConversation called');
    console.log('Messages:', messages);
    console.log('StartTime:', startTime);

    if (messages.length === 0 || !startTime) {
      console.log('Skipping save: no messages or start time');
      return;
    }

    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found, skipping save');
        return;
      }

      const title = conversationTitleRef.current || `Conversation on ${new Date().toLocaleDateString()}`;
      const transcript = messages.map(m => `${m.role}: ${m.content}`).join('\n');

      console.log('Saving conversation:', { title, transcript, user_id: user.id });

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title,
          transcript,
          // audio_url can be added later if you implement audio recording
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Conversation saved successfully:', result);
      } else {
        console.error('Failed to save conversation:', result);
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }, [messages, startTime]);

  const startConversation = useCallback(async () => {
    try {
      // Check usage limits first
      const canStart = await checkUsageLimits();
      if (!canStart && usageInfo && !usageInfo.canStartConversation) {
        return; // Don't start if at limit
      }

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "agent_7501k2msdrq5e6rs31xb2yw14eyk",
        connectionType: "websocket" as const,
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
  }, [conversation, checkUsageLimits, usageInfo]);

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

  // Circular Audio Visualizer component
  const CircularAudioVisualizer = ({ isActive, isSpeaking }: { isActive: boolean; isSpeaking: boolean }) => (
    <Box className="circular-audio-visualizer">
      {/* Wave rings */}
      <Box 
        className="wave-ring wave-ring-1" 
        sx={{ 
          animationPlayState: isActive ? "running" : "paused",
          opacity: isActive ? 1 : 0.3
        }} 
      />
      <Box 
        className="wave-ring wave-ring-2" 
        sx={{ 
          animationPlayState: isActive ? "running" : "paused",
          opacity: isActive ? 1 : 0.3
        }} 
      />
      <Box 
        className="wave-ring wave-ring-3" 
        sx={{ 
          animationPlayState: isActive ? "running" : "paused",
          opacity: isActive ? 1 : 0.3
        }} 
      />
      <Box 
        className="wave-ring wave-ring-4" 
        sx={{ 
          animationPlayState: isActive ? "running" : "paused",
          opacity: isActive ? 1 : 0.3
        }} 
      />
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          className="wave-particle"
          sx={{
            animationPlayState: isActive ? "running" : "paused",
            opacity: isActive ? 0.8 : 0.2,
          }}
        />
      ))}
      
      {/* Center circle */}
      <Box 
        className="circular-center"
        sx={{
          transform: isSpeaking ? "scale(1.1)" : "scale(1)",
          transition: "transform 0.3s ease",
          boxShadow: isSpeaking 
            ? "0 0 40px rgba(144, 202, 249, 0.8), 0 0 60px rgba(100, 181, 246, 0.6)" 
            : "0 0 30px rgba(144, 202, 249, 0.6)",
        }}
      >
        {isSpeaking ? (
          <Box className="speaking-icon">
            <Box className="sound-wave sound-wave-1" />
            <Box className="sound-wave sound-wave-2" />
            <Box className="sound-wave sound-wave-3" />
            <Box className="center-dot" />
          </Box>
        ) : (
          <Box className="mic-icon">
            <Box className="mic-body" />
            <Box className="mic-base" />
            <Box className="mic-stand" />
            <Box className="center-dot" />
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <AuthGate>
      <Box className="gradient-bg" sx={{ minHeight: "100vh" }}>
        {/* Debug Panel */}
        <DebugPanel
          isDebugMode={isDebugMode}
          onDebugModeChange={setIsDebugMode}
          metrics={currentMetrics}
          estimatedCost={getEstimatedCost(currentMetrics)}
          isConversationActive={conversation.status === "connected"}
        />

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
                onClick={() => router.push("/history")}
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
                      ? "Jarvis is speaking..." 
                      : "Listening... speak now"
                    : "Ready to connect"
                  }
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {conversation.status === "connected" 
                    ? "Having a conversation with Jarvis AI"
                    : "Click the button below to start your conversation"
                  }
                </Typography>
              </Box>

              {/* Circular Audio visualizer */}
              {conversation.status === "connected" && (
                <Box sx={{ my: 3 }}>
                  <CircularAudioVisualizer 
                    isActive={conversation.status === "connected"} 
                    isSpeaking={conversation.isSpeaking} 
                  />
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
                    {conversation.status === "connecting" ? "Connecting..." : "Start Conversation"}
                  </Button>
                ) : (
                  <Stack direction="row" spacing={2}>
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
                      End Conversation
                    </Button>
                    <Button 
                      onClick={saveConversation}
                      variant="outlined"
                      size="large"
                      sx={{ 
                        borderRadius: 4,
                        px: 4,
                        py: 2,
                        textTransform: "none",
                        fontSize: "1rem",
                        borderColor: "rgba(144, 202, 249, 0.5)",
                        "&:hover": {
                          borderColor: "#90caf9",
                          background: "rgba(144, 202, 249, 0.1)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      Save Now
                    </Button>
                  </Stack>
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

        {/* Usage Limit Modal */}
        {usageInfo && (
          <UsageLimitModal
            open={showUsageModal}
            onClose={() => setShowUsageModal(false)}
            conversationsUsed={usageInfo.conversationsUsed}
            conversationsLimit={usageInfo.conversationsLimit}
            planType={usageInfo.planType}
            onUpgrade={() => {
              // TODO: Navigate to billing/upgrade page
              router.push('/settings');
            }}
          />
        )}
      </Box>
    </AuthGate>
  );
}


