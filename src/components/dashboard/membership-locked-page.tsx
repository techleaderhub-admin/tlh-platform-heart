import { ArrowLeft, LockKeyhole, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MembershipLockedPage({
  feature,
  required,
}: {
  feature: string;
  required: string;
}) {
  return (
    <StudentShell
      title={feature}
      subtitle={`${feature} is part of the ${required} membership journey.`}
      membershipLabel="Membership"
    >
      <Card className="mx-auto max-w-2xl overflow-hidden border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-8 text-center sm:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LockKeyhole className="size-7" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-primary">
            Membership access
          </p>
          <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
            {required} membership required
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Your current membership does not include this workspace yet. Upgrade your membership to unlock {feature.toLowerCase()}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/dashboard">
                <ArrowLeft />
                Back to journey
              </Link>
            </Button>
            <Button variant="outline" disabled>
              <Sparkles />
              Upgrade path coming soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </StudentShell>
  );
}
