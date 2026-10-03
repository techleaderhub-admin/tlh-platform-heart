import { isRedirect, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { requireRole } from "@/lib/route-auth";

export type MembershipLevel = Database["public"]["Enums"]["membership_level"];

const RANK: Record<MembershipLevel, number> = {
  free: 0,
  l0: 1,
  l1: 2,
  l2: 3,
  l3: 4,
  l4: 5,
};

export const MEMBERSHIP_LABEL: Record<MembershipLevel, string> = {
  free: "Free",
  l0: "Bronz",
  l1: "Silver",
  l2: "Gold",
  l3: "Diamond",
  // Reserved internal level. Quantum is intentionally not active in the current product.
  l4: "Diamond",
};

export function membershipLabel(level: MembershipLevel) {
  return `${MEMBERSHIP_LABEL[level]} Membership`;
}

export function hasMembership(level: MembershipLevel, minimum: MembershipLevel) {
  return RANK[level] >= RANK[minimum];
}

export async function getCurrentMembership(): Promise<MembershipLevel> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw redirect({ to: "/login", replace: true });

  const { data, error } = await supabase
    .from("student_memberships")
    .select("level, is_active")
    .eq("student_id", userData.user.id)
    .maybeSingle();

  if (error) throw new Error(`Membership could not be loaded: ${error.message}`);
  return data?.is_active === false ? "free" : (data?.level ?? "free");
}

export async function requireMembership(
  minimum: Exclude<MembershipLevel, "free">,
  feature: string,
) {
  try {
    await requireRole("student");
    const membership = await getCurrentMembership();
    if (!hasMembership(membership, minimum)) {
      throw redirect({
        to: "/dashboard/access-denied",
        search: {
          feature,
          required: MEMBERSHIP_LABEL[minimum],
        },
        replace: true,
      });
    }
    return { membership };
  } catch (error) {
    if (isRedirect(error)) throw error;
    console.error("requireMembership failed", error);
    throw redirect({ to: "/dashboard", replace: true });
  }
}
