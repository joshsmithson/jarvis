"use client";

import AuthGate from "@/components/AuthGate";
import Link from "next/link";
import { AppBar, Container, List, ListItem, ListItemButton, ListItemText, Stack, Toolbar, Typography, Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

interface Conversation {
  id: string;
  title: string;
  started_at: string;
  ended_at: string;
  created_at: string;
}

export default function HistoryPage() {
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
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Jarvis
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
      <Container maxWidth="sm">
        <Stack spacing={3} mt={6}>
          <Typography variant="h5" fontWeight={700}>
            Conversation History
          </Typography>
          {loading ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress />
            </Stack>
          ) : (
            <List>
              {conversations.length === 0 ? (
                <Typography color="text.secondary">No saved conversations yet. Start a call to create your first conversation!</Typography>
              ) : (
                conversations.map((c) => (
                  <ListItem key={c.id} disablePadding>
                    <ListItemButton component={Link} href={`/history/${c.id}`}>
                      <ListItemText 
                        primary={c.title} 
                        secondary={new Date(c.started_at).toLocaleDateString() + ' at ' + new Date(c.started_at).toLocaleTimeString()} 
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          )}
        </Stack>
      </Container>
    </AuthGate>
  );
}


