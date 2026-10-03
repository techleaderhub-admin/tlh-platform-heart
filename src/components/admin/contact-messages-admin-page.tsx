import { useEffect, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Message = Database["public"]["Tables"]["contact_messages"]["Row"];

export function ContactMessagesAdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (queryError) setError(queryError.message);
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const updateMessage = async (id: string, patch: Partial<Message>) => {
    setBusy(id);
    const { data, error: updateError } = await supabase
      .from("contact_messages")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (updateError || !data) setError(updateError?.message ?? "Could not update message.");
    else setMessages((current) => current.map((item) => item.id === id ? data : item));
    setBusy(null);
  };

  return (
    <AdminShell
      title="Contact Messages"
      subtitle="Review enquiries submitted through the public TLH Contact form."
    >
      <div className="space-y-5">
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card>}
        <Card>
          <CardHeader><CardTitle>{messages.length} message{messages.length === 1 ? "" : "s"}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="p-5 text-sm text-muted-foreground">Loading messages…</p> :
              messages.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No contact messages yet.</p> :
              messages.map((message) => (
                <div key={message.id} className="rounded-2xl border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{message.full_name}</p>
                      <a className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline" href={`mailto:${message.email}`}>
                        <Mail className="size-4" /> {message.email}
                      </a>
                      {message.phone && <p className="mt-1 text-xs text-muted-foreground">{message.phone}</p>}
                    </div>
                    <Select value={message.status} onValueChange={(value) => void updateMessage(message.id, { status: value })} disabled={busy === message.id}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {message.subject && <Badge variant="outline" className="mt-4">{message.subject}</Badge>}
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{message.message}</p>
                  <Textarea
                    className="mt-4 min-h-20"
                    placeholder="Internal admin notes…"
                    defaultValue={message.admin_notes ?? ""}
                    onBlur={(event) => {
                      const value = event.currentTarget.value;
                      if (value !== (message.admin_notes ?? "")) void updateMessage(message.id, { admin_notes: value });
                    }}
                    disabled={busy === message.id}
                  />
                  <p className="mt-3 text-xs text-muted-foreground">
                    Received {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(message.created_at))}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
