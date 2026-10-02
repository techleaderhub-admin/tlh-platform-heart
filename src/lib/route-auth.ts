import { redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth-validation";

export async function requireRole(role: AppRole) {
  let identity: { profile: { id: string; full_name: string | null; phone: string | null }; role: AppRole };
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw redirect({ to: "/login", replace: true });

    const [profileResult, roleResult] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone").eq("id", userData.user.id).single(),
      supabase.from("user_roles").select("role").eq("user_id", userData.user.id).maybeSingle(),
    ]);
    if (profileResult.error || roleResult.error || !roleResult.data) {
      throw redirect({ to: "/login", replace: true });
    }

    const metadataName = typeof userData.user.user_metadata?.full_name === "string"\n      ? userData.user.user_metadata.full_name.trim()\n      : "";\n    identity = {\n      profile: {\n        ...profileResult.data,\n        full_name: profileResult.data.full_name?.trim() || metadataName || null,\n      },\n      role: roleResult.data.role as AppRole,\n    };
  } catch {
    throw redirect({ to: "/login" });
  }
  if (identity.role !== role) {
    throw redirect({
      to: identity.role === "admin" ? "/admin" : "/dashboard",
      replace: true,
      reloadDocument: true,
    });
  }
  return identity;
}
