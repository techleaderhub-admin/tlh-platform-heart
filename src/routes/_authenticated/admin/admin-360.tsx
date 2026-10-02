import { createFileRoute } from "@tanstack/react-router";
import { Admin360Page } from "@/components/admin/admin-360-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/admin-360")({
 beforeLoad:()=>requireRole("admin"),
 head:()=>({meta:[{title:"Admin 360 | Tech Leader Hub"},{name:"description",content:"Central student operations workspace for Tech Leader Hub."}]}),
 component:Admin360,
});
function Admin360(){return <Admin360Page/>;}
