"use client";

import AuthGate from "@/components/AuthGate";
import { AppBar, Box, Button, Container, IconButton, Paper, Stack, Toolbar, Typography, CircularProgress } from "@mui/material";
import { ArrowBack, Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string;
  transcript: string;
  started_at: string;
  ended_at: string;
  created_at: string;
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
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <IconButton onClick={() => router.push('/history')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Conversation Details
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button href="/" variant="outlined">Home</Button>
            <Button href="/call" variant="contained">Start Call</Button>
            <Button onClick={async () => {
              const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
              const supabase = getSupabaseBrowserClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}>Sign out</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="md">
        {loading ? (
          <Stack alignItems="center" py={8}>
            <CircularProgress />
          </Stack>
        ) : conversation ? (
          <Stack spacing={3} mt={6}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {conversation.title}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {new Date(conversation.started_at).toLocaleDateString()} at{' '}
                  {new Date(conversation.started_at).toLocaleTimeString()}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Duration: {Math.round((new Date(conversation.ended_at).getTime() - new Date(conversation.started_at).getTime()) / 1000 / 60)} minutes
                </Typography>
              </Box>
              <IconButton onClick={handleDelete} color="error">
                <Delete />
              </IconButton>
            </Stack>

            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Conversation Transcript
              </Typography>
              {conversation.transcript ? (
                <Stack spacing={2}>
                  {formatTranscript(conversation.transcript).map((message) => (
                    <Box 
                      key={message.index}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: message.role === 'user' ? 'action.hover' : 'primary.main',
                        color: message.role === 'user' ? 'text.primary' : 'primary.contrastText',
                        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                      }}
                    >
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {message.role === 'user' ? 'You' : 'Jarvis'}
                      </Typography>
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No transcript available for this conversation.
                </Typography>
              )}
            </Paper>
          </Stack>
        ) : (
          <Stack alignItems="center" py={8}>
            <Typography variant="h6" color="text.secondary">
              Conversation not found
            </Typography>
            <Button onClick={() => router.push('/history')} sx={{ mt: 2 }}>
              Back to History
            </Button>
          </Stack>
        )}
      </Container>
    </AuthGate>
  );
}



