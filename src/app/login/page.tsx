"use client";

import { Box, Button, Container, Stack, Typography } from "@mui/material";

export default function LoginPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function signInWithGoogle() {
    const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}` } });
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={4} alignItems="center" mt={12}>
        <Typography variant="h4" fontWeight={700} textAlign="center">
          Sign in to Jarvis
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Continue with your Google account to start a real-time voice conversation.
        </Typography>
        {!envConfigured ? (
          <Typography color="error" textAlign="center">
            Environment variables are not set. Please create a `.env.local` file with
            `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
          </Typography>
        ) : (
          <Box>
            <Button variant="contained" size="large" onClick={signInWithGoogle}>
              Sign in with Google
            </Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
}


