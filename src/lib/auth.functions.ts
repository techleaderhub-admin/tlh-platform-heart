import { createClient } from "@supabase/supabase-js";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { loginSchema, normalizePhone, type AppRole } from "@/lib/auth-validation";

const GENERIC_AUTH_ERROR = "Invalid email or phone number, or password.";

function createAuthClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      // Password-reset emails are requested from this server-side client.
      // Use the implicit recovery flow so the browser receives the recovery
      // session directly and does not depend on a PKCE verifier stored on the
      // server.
      flowType: "implicit",
    },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const signInWithIdentifier = createServerFn({ method: "POST" })
  .validator((input: unknown) => loginSchema.parse(input))
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim();
    const parsedEmail = z.string().email().safeParse(identifier);
    let email = parsedEmail.success ? parsedEmail.data.toLowerCase() : "";

    if (!parsedEmail.success) {
      const phone = normalizePhone(identifier);
      if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error(GENERIC_AUTH_ERROR);

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (profileError || !profile) throw new Error(GENERIC_AUTH_ERROR);
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      if (userError || !userData.user.email) throw new Error(GENERIC_AUTH_ERROR);
      email = userData.user.email;
    }

    const authClient = createAuthClient();
    const { data: authData, error } = await authClient.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (error || !authData.session) throw new Error(GENERIC_AUTH_ERROR);
    return {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    };
  });

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    identifier: z.string().trim().min(1),
    redirectTo: z.string().url(),
  }).parse(input))
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim();
    const parsedEmail = z.string().email().safeParse(identifier);
    let email = parsedEmail.success ? parsedEmail.data.toLowerCase() : "";

    if (!parsedEmail.success) {
      const phone = normalizePhone(identifier);
      if (!/^\+[1-9]\d{7,14}$/.test(phone)) return { accepted: true };

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (!profile) return { accepted: true };

      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      if (!userData.user?.email) return { accepted: true };
      email = userData.user.email;
    }

    const authClient = createAuthClient();
    await authClient.auth.resetPasswordForEmail(email, {
      redirectTo: data.redirectTo,
    });

    return { accepted: true };
  });

export const getMyIdentity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profileResult, roleResult] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("id, full_name, phone")
        .eq("id", context.userId)
        .single(),
      context.supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);

    if (profileResult.error || roleResult.error || !roleResult.data) {
      throw new Error("Your account could not be loaded. Please sign in again.");
    }

    return {
      profile: profileResult.data,
      role: roleResult.data.role as AppRole,
    };
  });
