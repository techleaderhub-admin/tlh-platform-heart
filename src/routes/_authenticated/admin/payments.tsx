import { createFileRoute } from "@tanstack/react-router";
import { PaymentsAdminPage } from "@/components/admin/payments-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route=createFileRoute("/_authenticated/admin/payments")({
 beforeLoad:()=>requireRole("admin"),
 head:()=>({meta:[{title:"Payments & Automation | Tech Leader Hub"},{name:"description",content:"Admin payment catalog, ledger and membership automation."}]}),
 component:PaymentsAdminPage,
});
