import { createFileRoute } from "@tanstack/react-router";
import { L3LiveSessionsAdminPage } from "@/components/admin/l3-live-sessions-admin-page";
import { requireRole } from "@/lib/route-auth";
export const Route=createFileRoute("/_authenticated/admin/l3-live-sessions")({beforeLoad:()=>requireRole("admin"),head:()=>({meta:[{title:"Weekly Live Sessions | TLH Admin"}]}),component:L3LiveSessionsAdminPage});
