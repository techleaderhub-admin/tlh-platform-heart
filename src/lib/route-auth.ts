import { isRedirect, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth-validation";

type Identity = {
  profile: { id: string; full_name: string | null; phone: string | null };
  role: AppRole;
};

/**
 * Route guard for the authenticated workspaces.
 *
 * - A user may hold several roles (signup always adds "student"); admin wins when present.
 * - Blocked or soft-deleted accounts are signed out on every protected navigation,
 *   not only at login.
 * - Real failures still send the user to /login, but redirects are passed through untouched.
 */
export async function requireRole(role: AppRole): Promise<Identity> {
  let identity: Identity;
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) throw redirect({ to: "/login", replace: true });

    const [profileResult, roleResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, phone, is_blocked, deleted_at")
        .eq("id", userData.user.id)
        .single(),
      supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
    ]);
    if (profileResult.error || roleResult.error || !roleResult.data?.length) {
      throw redirect({ to: "/login", replace: true });
    }

    if (profileResult.data.is_blocked || profileResult.data.deleted_at) {
      await supabase.auth.signOut();
      throw redirect({ to: "/login", replace: true });
    }

    const roles = roleResult.data.map((row) => row.role as AppRole);
    const metadataName =
      typeof userData.user.user_metadata?.["full_name"] === "string"
        ? String(userData.user.user_metadata["full_name"]).trim()
        : "";
    identity = {
      profile: {
        id: profileResult.data.id,
        phone: profileResult.data.phone,
        full_name: profileResult.data.full_name?.trim() || metadataName || null,
      },
      role: roles.includes("admin") ? "admin" : (roles[0] ?? "student"),
    };
  } catch (error) {
    if (isRedirect(error)) throw error;
    console.error("requireRole failed", error);
    throw redirect({ to: "/login", replace: true });
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
