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
    const userId = typeof body.user_id === "string" ? body.user_id : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!userId || !email) return json({ error: "User ID and email are required." }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Please enter a valid email address." }, 400);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: target, error: targetError } = await adminClient.auth.admin.getUserById(userId);
    if (targetError || !target.user) return json({ error: "Leader account could not be found." }, 404);

    const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
      email,
      email_confirm: true,
    });

    if (error) return json({ error: error.message }, 400);

    return json({ user_id: userId, email: data.user.email ?? email });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected server error." }, 500);
  }
});
