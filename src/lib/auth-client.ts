import type { QueryClient } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth-validation";

export const destinationForRole = (role: AppRole) => (role === "admin" ? "/admin" : "/dashboard");

export async function signOutAndReturnToLogin(queryClient: QueryClient, returnToLogin: () => Promise<unknown>) {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
  await returnToLogin();
}
