import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, CheckCircle2, FileText, Plus, Save, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { membershipLabel } from "@/lib/membership-access";
import type { Database } from "@/integrations/supabase/types";

type CareerProfile = Database["public"]["Tables"]["career_profiles"]["Row"];

const DEFAULT_FORM = {
  current_company: "",
  current_job_role: "",
  experience_years: "",
  target_role: "",
  target_compensation: "",
  notice_period_days: "",
  career_goal: "",
  resume_url: "",
  primary_skills: [] as string[],
  preferred_locations: [] as string[],
  linkedin_url: "",
};

function ProfileListEditor({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const value = draft.trim();
    if (!value || values.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    onChange([...values, value]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={add} aria-label={"Add " + label}>
          <Plus />
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((value) => (
            <Badge key={value} variant="secondary" className="gap-1 pr-1">
              {value}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-background/60"
                onClick={() => onChange(values.filter((item) => item !== value))}
                aria-label={"Remove " + value}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Press Enter or Add to save each item.</p>
    </div>
  );
}

export function CareerProfilePage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membershipLabel, setMembershipLabel] = useState("Free Membership");
  const [accountName, setAccountName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhone, setAccountPhone] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Your session could not be loaded. Please sign in again.");
      setLoading(false);
      return;
    }

    setAccountEmail(userData.user.email ?? "");
    const metadataName = typeof userData.user.user_metadata?.full_name === "string"
      ? userData.user.user_metadata.full_name.trim()
      : "";
    const [{ data, error: profileError }, { data: membership }, { data: accountProfile, error: accountProfileError }] = await Promise.all([
      supabase.from("career_profiles").select("*").eq("student_id", userData.user.id).maybeSingle(),
      supabase.from("student_memberships").select("level, is_active").eq("student_id", userData.user.id).maybeSingle(),
      supabase.from("profiles").select("full_name, phone, linkedin_url").eq("id", userData.user.id).maybeSingle(),
    ]);
    if (!accountProfileError) {
      setAccountName(accountProfile?.full_name ?? "");
      setAccountPhone(accountProfile?.phone ?? "");
    }

    if (membership?.is_active !== false && membership?.level) {
      setMembershipLabel(membershipLabel(membership.level));
    }

    if (profileError) {
      setError("We could not load your career profile. Please refresh and try again.");
    } else if (data) {
      const profile: CareerProfile = data;
      setForm({
        current_company: profile.current_company ?? "",
        current_job_role: profile.current_job_role ?? "",
        experience_years: profile.experience_years?.toString() ?? "",
        target_role: profile.target_role ?? "",
        target_compensation: profile.target_compensation?.toString() ?? "",
        notice_period_days: profile.notice_period_days?.toString() ?? "",
        career_goal: profile.career_goal ?? "",
        resume_url: profile.resume_url ?? "",
        primary_skills: profile.primary_skills ?? [],
        preferred_locations: profile.preferred_locations ?? [],
        linkedin_url: accountProfile?.linkedin_url ?? "",
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const update = <K extends keyof typeof DEFAULT_FORM>(key: K, value: (typeof DEFAULT_FORM)[K]) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Your session has expired. Please sign in again.");
      setSaving(false);
      return;
    }

    const experience = form.experience_years ? Number(form.experience_years) : null;
    const compensation = form.target_compensation ? Number(form.target_compensation) : null;
    const notice = form.notice_period_days ? Number(form.notice_period_days) : null;

    if (experience !== null && (Number.isNaN(experience) || experience < 0 || experience > 50)) {
      setError("Experience must be a number between 0 and 50 years.");
      setSaving(false);
      return;
    }

    if (compensation !== null && (Number.isNaN(compensation) || compensation < 0)) {
      setError("Target compensation must be a valid positive number.");
      setSaving(false);
      return;
    }

    if (notice !== null && (Number.isNaN(notice) || notice < 0 || notice > 365)) {
      setError("Notice period must be between 0 and 365 days.");
      setSaving(false);
      return;
    }

    const normalizedName = accountName.trim() || null;
    const normalizedPhone = accountPhone.trim() || null;
    if (normalizedPhone && !/^\+[1-9]\d{7,14}$/.test(normalizedPhone.replace(/[\s()-]/g, ""))) {
      setError("Phone number must be in international format, for example +919810123456.");
      setSaving(false);
      return;
    }

    const normalizedPhoneForSave = normalizedPhone ? normalizedPhone.replace(/[\s()-]/g, "") : null;
    const { error: identitySaveError } = await supabase
      .from("profiles")
      .update({
        full_name: normalizedName,
        phone: normalizedPhoneForSave,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userData.user.id);

    if (identitySaveError) {
      setError("Could not save your name or phone number. " + identitySaveError.message);
      setSaving(false);
      return;
    }

    // Keep the display name in Auth metadata in sync. Email is intentionally not changed here.
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        full_name: normalizedName,
        phone: normalizedPhoneForSave,
      },
    });
    if (metadataError) {
      setError("Your profile was saved, but the account metadata could not be synchronized. " + metadataError.message);
      setSaving(false);
      return;
    }

    const payload = {
      student_id: userData.user.id,
      current_company: form.current_company.trim() || null,
      current_job_role: form.current_job_role.trim() || null,
      experience_years: experience,
      target_role: form.target_role.trim() || null,
      target_compensation: compensation,
      notice_period_days: notice,
      career_goal: form.career_goal.trim() || null,
      resume_url: form.resume_url.trim() || null,
      primary_skills: form.primary_skills,
      preferred_locations: form.preferred_locations,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = await supabase
      .from("career_profiles")
      .upsert(payload, { onConflict: "student_id" });

    if (!saveError) {
      const { error: accountSaveError } = await supabase
        .from("profiles")
        .update({ linkedin_url: form.linkedin_url.trim() || null })
        .eq("id", userData.user.id);
      if (accountSaveError) {
        setError("Career profile saved, but LinkedIn could not be saved. " + accountSaveError.message);
        setSaving(false);
        return;
      }
    }

    if (saveError) {
      setError("Could not save your career profile. " + saveError.message);
    } else {
      setSaved(true);
    }

    setSaving(false);
  };

  const completionFields = [
    form.current_company,
    form.current_job_role,
    form.experience_years,
    form.target_role,
    form.target_compensation,
    form.notice_period_days,
    form.career_goal,
    form.primary_skills.length ? "skills" : "",
    form.preferred_locations.length ? "locations" : "",
    form.linkedin_url,
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <StudentShell
      title="Career Profile"
      subtitle="Create the career profile that TLH will use as the foundation for assessments, roadmap planning, learning and job workflows."
      membershipLabel={membershipDisplayLabel}
    >
      <form onSubmit={save} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft />
              Back to dashboard
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{completion}% complete</span>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Saved
              </span>
            )}
            <Button type="submit" disabled={saving || loading}>
              <Save />
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm font-medium text-destructive">{error}</CardContent>
          </Card>
        )}

        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle>Profile identity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account-name">Name</Label>
              <Input
                id="account-name"
                value={accountName}
                onChange={(e) => { setSaved(false); setAccountName(e.target.value); }}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-phone">Phone Number</Label>
              <Input
                id="account-phone"
                type="tel"
                inputMode="tel"
                value={accountPhone}
                onChange={(e) => { setSaved(false); setAccountPhone(e.target.value); }}
                placeholder="+919810123456"
              />
              <p className="text-xs text-muted-foreground">Use your complete international number. Phone verification is not enabled by this profile form.</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="mt-2 break-all text-sm font-semibold">{accountEmail || "Email not available"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed here. Contact Tech Leader Hub if you need an email change.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn profile</Label>
              <Input
                id="linkedin"
                type="url"
                value={form.linkedin_url}
                onChange={(e) => update("linkedin_url", e.target.value)}
                placeholder="https://www.linkedin.com/in/your-name"
              />
              <p className="text-xs text-muted-foreground">Optional. Use your public LinkedIn profile URL.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current career</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="current-company">Current company</Label>
              <Input id="current-company" value={form.current_company} onChange={(e) => update("current_company", e.target.value)} placeholder="e.g. Product company / Service company" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current-role">Current job role</Label>
              <Input id="current-role" value={form.current_job_role} onChange={(e) => update("current_job_role", e.target.value)} placeholder="e.g. Senior Android Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input id="experience" type="number" min="0" max="50" step="0.5" value={form.experience_years} onChange={(e) => update("experience_years", e.target.value)} placeholder="e.g. 8.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notice">Notice period (days)</Label>
              <Input id="notice" type="number" min="0" max="365" value={form.notice_period_days} onChange={(e) => update("notice_period_days", e.target.value)} placeholder="e.g. 30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target career</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="target-role">Target role</Label>
              <Input id="target-role" value={form.target_role} onChange={(e) => update("target_role", e.target.value)} placeholder="e.g. Lead Android Engineer / Mobile Architect" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compensation">Target compensation (₹ LPA)</Label>
              <Input id="compensation" type="number" min="0" step="0.5" value={form.target_compensation} onChange={(e) => update("target_compensation", e.target.value)} placeholder="e.g. 36" />
              <p className="text-xs text-muted-foreground">Enter the annual target in LPA, for example 36 for ₹36 LPA.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal">Career goal</Label>
              <Textarea id="goal" value={form.career_goal} onChange={(e) => update("career_goal", e.target.value)} placeholder="What are you trying to achieve in your next career move?" rows={5} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills & preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <ProfileListEditor
              label="Primary skills"
              values={form.primary_skills}
              onChange={(values) => update("primary_skills", values)}
              placeholder="e.g. Kotlin"
            />
            <ProfileListEditor
              label="Preferred locations"
              values={form.preferred_locations}
              onChange={(values) => update("preferred_locations", values)}
              placeholder="e.g. Bengaluru"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4">
              <FileText className="mt-0.5 size-5 text-primary" />
              <div className="flex-1 space-y-2">
                <Label htmlFor="resume">Resume URL</Label>
                <Input id="resume" type="url" value={form.resume_url} onChange={(e) => update("resume_url", e.target.value)} placeholder="https://..." />
                <p className="text-xs text-muted-foreground">
                  Resume upload/storage will be connected in the dedicated resume workflow. For now, you can store a secure file URL.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </StudentShell>
  );
}
