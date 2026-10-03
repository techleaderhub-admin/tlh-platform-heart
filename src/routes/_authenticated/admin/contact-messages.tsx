import { createFileRoute } from "@tanstack/react-router";

import { ContactMessagesAdminPage } from "@/components/admin/contact-messages-admin-page";

export const Route = createFileRoute("/_authenticated/admin/contact-messages")({
  head: () => ({
    meta: [
      { title: "Contact Messages | TLH Admin" },
      { name: "description", content: "Manage public Tech Leader Hub contact enquiries." },
    ],
  }),
  component: ContactMessagesAdminPage,
});
