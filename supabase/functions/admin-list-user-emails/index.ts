import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: "Supabase server configuration is incomplete." }, 500);
    }

    const authorization = req.headers.get("Authorization");
    if (!authorization) return json({ error: "Missing authorization." }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: callerData, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerData.user) return json({ error: "Unauthorized." }, 401);

    const { data: adminRole, error: roleError } = await callerClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !adminRole) return json({ error: "Admin access required." }, 403);

    const body = await req.json().catch(() => ({}));
    const userIds = Array.isArray(body.user_ids)
      ? body.user_ids.filter((id: unknown): id is string => typeof id === "string")
      : [];

    if (userIds.length === 0) return json({ emails: {} });

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const emails: Record<string, string> = {};

    let page = 1;
    const perPage = 1000;
    while (page <= 20) {
      const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (error) return json({ error: error.message }, 500);

      for (const user of data.users) {
        if (userIds.includes(user.id) && user.email) emails[user.id] = user.email;
      }

      if (data.users.length < perPage || userIds.every((id: string) => id in emails)) break;
      page += 1;
    }

    return json({ emails });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected server error." }, 500);
  }
});
