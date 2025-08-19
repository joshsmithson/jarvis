"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;
    (async function run() {
      if (!envConfigured) {
        if (!isMounted) return;
        setIsSignedIn(false);
        setLoading(false);
        router.replace("/login");
        return;
      }
      const { getSupabaseBrowserClient } = await import("@/lib/supabaseClient");
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data }) => {
        if (!isMounted) return;
        const session = data.session;
        setIsSignedIn(Boolean(session));
        setLoading(false);
        if (!session) router.replace("/login");
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsSignedIn(Boolean(session));
        if (!session) router.replace("/login");
      });
      unsubscribe = () => sub?.subscription.unsubscribe();
    })();
    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [router, envConfigured]);

  if (loading) return null;
  if (!isSignedIn) return null;
  return <>{children}</>;
}


