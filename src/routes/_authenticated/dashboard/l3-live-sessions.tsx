import { createFileRoute } from "@tanstack/react-router";
import { L3LiveSessionsPage } from "@/components/dashboard/l3-live-sessions-page";
import { requireMembership } from "@/lib/membership-access";
export const Route=createFileRoute("/_authenticated/dashboard/l3-live-sessions")({beforeLoad:()=>requireMembership("l3","Diamond Live Sessions"),head:()=>({meta:[{title:"Weekly Live Sessions | Tech Leader Hub"}]}),component:L3LiveSessionsPage});
