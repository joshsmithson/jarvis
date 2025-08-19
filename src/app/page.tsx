"use client";

import { AppBar, Box, Button, Container, Stack, Toolbar, Typography } from "@mui/material";
import AuthGate from "@/components/AuthGate";

export default function Home() {
  async function signOut() {
    const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <AuthGate>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Jarvis
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button href="/call" variant="contained">Start Call</Button>
            <Button href="/history" variant="outlined">History</Button>
            <Button onClick={signOut}>Sign out</Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Box py={8}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome to Jarvis
          </Typography>
          <Typography color="text.secondary">
            Start a new real-time voice call with Jarvis or review your past conversations.
          </Typography>
        </Box>
      </Container>
    </AuthGate>
  );
}
