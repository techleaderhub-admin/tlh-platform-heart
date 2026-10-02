import { useEffect, useState } from "react";
import { FileText, Plus, RefreshCw, Power } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Resource = Database["public"]["Tables"]["foundation_resources"]["Row"];
type MembershipLevel = Database["public"]["Enums"]["membership_level"];

const levels: Array<{ value: MembershipLevel; label: string }> = [
  { value: "free", label: "Free" },
  { value: "l0", label: "L0" },
  { value: "l1", label: "L1 Silver" },
];

export function FoundationResourcesAdminPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [minimumMembership, setMinimumMembership] = useState<MembershipLevel>("free");
  const [required, setRequired] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("foundation_resources")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) setMessage("Could not load foundation resources.");
    else setResources(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const addResource = async () => {
    if (!title.trim() || !url.trim()) {
      setMessage("Title and PDF URL are required.");
      return;
    }
    setSaving(true);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage("Your admin session has expired.");
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("foundation_resources").insert({
      title: title.trim(),
      description: description.trim() || null,
      resource_url: url.trim(),
      minimum_membership: minimumMembership,
      is_required: required,
      created_by: userData.user.id,
      sort_order: resources.length,
    });
    if (error) setMessage(error.message);
    else {
      setTitle("");
      setDescription("");
      setUrl("");
      setMinimumMembership("free");
      setRequired(true);
      setMessage("Foundation PDF published.");
      await load();
    }
    setSaving(false);
  };

  const toggleActive = async (resource: Resource) => {
    const { error } = await supabase
      .from("foundation_resources")
      .update({ is_active: !resource.is_active })
      .eq("id", resource.id);
    if (error) setMessage(error.message);
    else await load();
  };

  return (
    <AdminShell
      title="Foundation Reading"
      subtitle="Publish and control the PDF resources used by the Free/L0 foundation journey."
    >
      <div className="space-y-6">
        {message && <Card><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="size-5 text-primary" />Publish a foundation PDF</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Android Fundamentals — Foundation Reading" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">PDF URL</label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." type="url" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should the student read or understand?" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum membership</label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={minimumMembership} onChange={(e) => setMinimumMembership(e.target.value as MembershipLevel)}>
                {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 self-end text-sm">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
              Required reading
            </label>
            <div className="md:col-span-2">
              <Button onClick={() => void addResource()} disabled={saving}>
                <FileText />
                {saving ? "Publishing…" : "Publish PDF"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Published resources</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Students only see active resources allowed by their membership.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} />Refresh</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {resources.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">No foundation PDF has been published yet.</p>
            ) : resources.map((resource) => (
              <div key={resource.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4">
                <div>
                  <p className="font-medium">{resource.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{resource.resource_url}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">{resource.minimum_membership}</Badge>
                    <Badge variant={resource.is_active ? "default" : "outline"}>{resource.is_active ? "Active" : "Inactive"}</Badge>
                    {resource.is_required && <Badge variant="outline">Required</Badge>}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => void toggleActive(resource)}>
                  <Power />
                  {resource.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
