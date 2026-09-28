import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { destinationForRole } from "@/lib/auth-client";
import { getMyIdentity } from "@/lib/auth.functions";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tech Leader Hub Platform" },
      { name: "description", content: "Secure access to the Tech Leader Hub platform." },
      { property: "og:title", content: "Tech Leader Hub Platform" },
      { property: "og:description", content: "Secure access to the Tech Leader Hub platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    async function routeAccount() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (!data.user) {
        await navigate({ to: "/login", replace: true });
        return;
      }
      try {
        const identity = await getMyIdentity();
        if (active) await navigate({ to: destinationForRole(identity.role), replace: true });
      } catch {
        await supabase.auth.signOut();
        if (active) await navigate({ to: "/login", replace: true });
      }
    }
    void routeAccount();
    return () => { active = false; };
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background" aria-label="Loading your account">
      <LoaderCircle aria-hidden="true" className="size-7 animate-spin text-accent" />
    </main>
  );
}
