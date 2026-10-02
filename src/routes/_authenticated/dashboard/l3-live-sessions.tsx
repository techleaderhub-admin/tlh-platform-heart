import { createFileRoute } from "@tanstack/react-router";
import { L3LiveSessionsPage } from "@/components/dashboard/l3-live-sessions-page";
import { requireRole } from "@/lib/route-auth";
export const Route=createFileRoute("/_authenticated/dashboard/l3-live-sessions")({beforeLoad:()=>requireRole("student"),head:()=>({meta:[{title:"Weekly Live Sessions | Tech Leader Hub"}]}),component:L3LiveSessionsPage});
