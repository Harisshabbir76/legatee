import { redirect } from "next/navigation";
import { checkAuth, fetchContactMessages } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import MessagesManager from "../_components/MessagesManager";

export default async function MessagesPage() {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }

  const messages = await fetchContactMessages();

  return (
    <AdminShell title="Messages">
      <MessagesManager initialMessages={messages} />
    </AdminShell>
  );
}
