import { useEffect, useMemo, useState } from "react";
import { Edit3, Mail, Phone, RefreshCw, Search, ShieldAlert, ShieldCheck, Trash2, Users, X } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { getLeaderEmail, updateLeaderEmail } from "@/lib/auth.functions";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Membership = Database["public"]["Tables"]["student_memberships"]["Row"];
type MembershipLevel = Database["public"]["Enums"]["membership_level"];

const MEMBERSHIP_LEVELS: MembershipLevel[] = ["free", "l0", "l1", "l2", "l3"];

const MEMBERSHIP_LABELS: Record<MembershipLevel, string> = {
  free: "Free",
  l0: "Bronz",
  l1: "Silver",
  l2: "Gold",
  l3: "Diamond",
  l4: "L4",
};

const MEMBERSHIP_DESCRIPTIONS: Record<MembershipLevel, string> = {
  free: "Free access",
  l0: "Bronz access",
  l1: "Silver access",
  l2: "Gold access",
  l3: "Diamond access",
  l4: "L4 access",
};

function membershipBadgeClass(level: MembershipLevel) {
  switch (level) {
    case "free":
      return "border-border text-muted-foreground";
    case "l0":
      return "border-slate-400/40 bg-slate-500/10 text-slate-700 dark:text-slate-300";
    case "l1":
      return "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300";
    case "l2":
      return "border-cyan-500/40 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300";
    case "l3":
      return "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "l4":
      return "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300";
  }
}

export function StudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [memberships, setMemberships] = useState<Record<string, Membership>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLinkedIn, setEditLinkedIn] = useState("");
  const [actionStudentId, setActionStudentId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    setSaveError(null);

    const [{ data: profiles, error: profileError }, { data: roles, error: roleError }, { data: membershipRows, error: membershipError }] =
      await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("student_memberships").select("*"),
      ]);

    if (profileError || roleError || membershipError) {
      setError("We could not load Leaders and memberships. Please refresh and try again.");
      setStudents([]);
      setMemberships({});
    } else {
      const adminIds = new Set((roles ?? []).filter((row) => row.role === "admin").map((row) => row.user_id));
      const studentRows = (profiles ?? []).filter((profile) => !adminIds.has(profile.id) && !profile.deleted_at);
      const membershipMap = Object.fromEntries(
        (membershipRows ?? []).map((membership) => [membership.student_id, membership]),
      ) as Record<string, Membership>;

      setStudents(studentRows);
      setMemberships(membershipMap);

    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.full_name ?? "", student.phone ?? ""].some((value) => value.toLowerCase().includes(term)),
    );
  }, [search, students]);

  const openEdit = async (student: Profile) => {
    setEditingStudent(student);
    setEditName(student.full_name ?? "");
    setEditEmail("");
    setEditPhone(student.phone ?? "");
    setEditLinkedIn(student.linkedin_url ?? "");
    setSaveError(null);
    setSuccess(null);

    try {
      const result = await getLeaderEmail({ data: { userId: student.id } });
      setEditEmail(result.email);
    } catch (emailError) {
      setSaveError(emailError instanceof Error ? emailError.message : "Could not load the Leader email.");
    }
  };

  const saveProfile = async () => {
    if (!editingStudent) return;
    setActionStudentId(editingStudent.id);
    setSaveError(null);
    setSuccess(null);
    const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] = {
      full_name: editName.trim() || null,
      phone: editPhone.trim() || null,
      updated_at: new Date().toISOString(),
    };

    // LinkedIn is optional. Do not touch the column when the field is empty,
    // so Name/Phone edits remain usable even in an environment where the
    // optional linkedin_url migration has not reached the database yet.
    if (editLinkedIn.trim()) {
      profileUpdate.linkedin_url = editLinkedIn.trim();
    }

    const normalizedEmail = editEmail.trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setSaveError("Please enter a valid email address.");
      setActionStudentId(null);
      return;
    }

    try {
      const currentEmail = (await getLeaderEmail({ data: { userId: editingStudent.id } })).email.trim().toLowerCase();
      if (normalizedEmail !== currentEmail) {
        await updateLeaderEmail({ data: { userId: editingStudent.id, email: normalizedEmail } });
      }
    } catch (emailError) {
      setSaveError(emailError instanceof Error ? emailError.message : "Could not update this Leader's email.");
      setActionStudentId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", editingStudent.id);

    if (updateError) {
      setSaveError("Could not update this Leader. " + updateError.message);
    } else {
      setStudents((current) => current.map((student) =>
        student.id === editingStudent.id
          ? { ...student, full_name: editName.trim() || null, phone: editPhone.trim() || null, linkedin_url: editLinkedIn.trim() || null, updated_at: new Date().toISOString() }
          : student,
      ));
      setSuccess("Leader information updated successfully.");
      setEditingStudent(null);
    }
    setActionStudentId(null);
  };

  const toggleBlock = async (student: Profile) => {
    const nextBlocked = !student.is_blocked;
    if (!window.confirm(nextBlocked
      ? "Block this Leader? They will be prevented from signing in."
      : "Unblock this Leader and allow sign-in again?")) return;

    setActionStudentId(student.id);
    setSaveError(null);
    setSuccess(null);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ is_blocked: nextBlocked, updated_at: new Date().toISOString() })
      .eq("id", student.id);

    if (updateError) {
      setSaveError("Could not change the block status. " + updateError.message);
    } else {
      setStudents((current) => current.map((row) =>
        row.id === student.id ? { ...row, is_blocked: nextBlocked, updated_at: new Date().toISOString() } : row,
      ));
      setSuccess(nextBlocked ? "Leader has been blocked." : "Leader has been unblocked.");
    }
    setActionStudentId(null);
  };

  const deleteProfile = async (student: Profile) => {
    if (!window.confirm("Delete this Leader from the admin directory? This hides the profile and prevents sign-in. The Auth account remains for safe recovery.")) return;

    setActionStudentId(student.id);
    setSaveError(null);
    setSuccess(null);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString(), is_blocked: true, updated_at: new Date().toISOString() })
      .eq("id", student.id);

    if (updateError) {
      setSaveError("Could not delete this Leader profile. " + updateError.message);
    } else {
      setStudents((current) => current.filter((row) => row.id !== student.id));
      setSuccess("Leader profile removed from the admin directory.");
    }
    setActionStudentId(null);
  };

  const changeMembership = async (studentId: string, level: MembershipLevel) => {
    const previous = memberships[studentId]?.level ?? "free";
    if (previous === level) return;

    setSavingStudentId(studentId);
    setSaveError(null);
    setSuccess(null);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      setSaveError("Your admin session has expired. Please sign in again.");
      setSavingStudentId(null);
      return;
    }

    const { data, error: membershipError } = await supabase
      .from("student_memberships")
      .upsert(
        {
          student_id: studentId,
          level,
          is_active: true,
          assigned_by: authData.user.id,
          assigned_at: new Date().toISOString(),
        },
        { onConflict: "student_id" },
      )
      .select("*")
      .single();

    if (membershipError || !data) {
      setSaveError("Could not change membership for this Leader. " + (membershipError?.message ?? ""));
      setSavingStudentId(null);
      return;
    }

    setMemberships((current) => ({ ...current, [studentId]: data }));
    setSuccess("Membership changed from " + MEMBERSHIP_LABELS[previous] + " to " + MEMBERSHIP_LABELS[level] + ".");
    setSavingStudentId(null);
  };

  return (
    <AdminShell
      title="Leaders"
      subtitle="Review registered TLH users and manage their membership access. Membership changes are enforced by the database."
    >
      <Card className="border-border/80 bg-card/80">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or phone..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => void load()} disabled={loading || savingStudentId !== null}>
              <RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />
              Refresh
            </Button>
          </div>
          {saveError && <p className="mt-3 text-sm font-medium text-destructive">{saveError}</p>}
          {success && <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">{success}</p>}
        </CardContent>
      </Card>

      <Card className="mt-5 overflow-hidden border-border/80 bg-card/80">
        {error ? (
          <div className="p-8 text-center">
            <p className="font-medium text-destructive">{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => void load()}>Try again</Button>
          </div>
        ) : loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted/50" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">No Leaders found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try a different search." : "Leaders will appear here after they create a TLH account."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Leader</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold">Membership</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((student) => {
                  const membership = memberships[student.id];
                  const level: MembershipLevel =
                    membership?.is_active === false ? "free" : (membership?.level ?? "free");
                  const saving = savingStudentId === student.id;
                  const acting = actionStudentId === student.id;

                  return (
                    <tr key={student.id} className="hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{student.full_name || "Unnamed leader"}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">User ID: {student.id.slice(0, 8)}…</p>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{emails[student.id] || "—"}</td>
                      <td className="px-5 py-4 text-muted-foreground">{student.phone || "—"}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(student.created_at))}
                      </td>
                      <td className="px-5 py-4"><Badge variant="outline">Leader</Badge></td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-[210px] items-center gap-2">
                          <Badge variant="outline" className={membershipBadgeClass(level)}>
                            {MEMBERSHIP_LABELS[level]}
                          </Badge>
                          <Select
                            value={level}
                            onValueChange={(value) => void changeMembership(student.id, value as MembershipLevel)}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-[128px] bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MEMBERSHIP_LEVELS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {MEMBERSHIP_LABELS[option]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {saving && <p className="mt-1 text-xs text-muted-foreground">Saving access…</p>}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={student.is_blocked ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}>
                          {student.is_blocked ? "Blocked" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" disabled={acting} title="Edit Leader" onClick={() => openEdit(student)}>
                            <Edit3 />
                          </Button>
                          <Button variant="ghost" size="sm" disabled={acting} title={student.is_blocked ? "Unblock Leader" : "Block Leader"} onClick={() => void toggleBlock(student)}>
                            {student.is_blocked ? <ShieldCheck /> : <ShieldAlert />}
                          </Button>
                          <Button variant="ghost" size="sm" disabled={acting} title="Delete Leader profile" onClick={() => void deleteProfile(student)}>
                            <Trash2 />
                          </Button>
                          {student.phone && (
                            <Button asChild variant="ghost" size="sm">
                              <a href={"tel:" + student.phone}><Phone /></a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" disabled title="Email is stored in Supabase Auth and is not exposed to the profiles table.">
                            <Mail />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editingStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-leader-title">
          <Card className="w-full max-w-lg shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="edit-leader-title" className="font-heading text-xl font-bold">Edit Leader</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Update the profile information visible to TLH.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingStudent(null)} aria-label="Close edit form"><X /></Button>
              </div>
              <div className="mt-6 space-y-4">
                <div className="space-y-2"><label htmlFor="admin-edit-name" className="text-sm font-medium">Full Name</label><Input id="admin-edit-name" value={editName} onChange={(event) => setEditName(event.target.value)} /></div>
                <div className="space-y-2"><label htmlFor="admin-edit-email" className="text-sm font-medium">Email</label><Input id="admin-edit-email" type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} placeholder="leader@example.com" /><p className="text-xs text-muted-foreground">Only Admin can change a Leader email after signup verification.</p></div>
                <div className="space-y-2"><label htmlFor="admin-edit-phone" className="text-sm font-medium">Phone Number</label><Input id="admin-edit-phone" value={editPhone} onChange={(event) => setEditPhone(event.target.value)} inputMode="tel" /></div>
                <div className="space-y-2"><label htmlFor="admin-edit-linkedin" className="text-sm font-medium">LinkedIn URL</label><Input id="admin-edit-linkedin" value={editLinkedIn} onChange={(event) => setEditLinkedIn(event.target.value)} placeholder="https://www.linkedin.com/in/..." /></div>
                {saveError ? <p className="text-sm font-medium text-destructive">{saveError}</p> : null}
                <div className="flex justify-end gap-2 pt-2"><Button variant="outline" onClick={() => setEditingStudent(null)}>Cancel</Button><Button onClick={() => void saveProfile()} disabled={actionStudentId === editingStudent.id}>{actionStudentId === editingStudent.id ? "Saving…" : "Save changes"}</Button></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AdminShell>
  );
}
