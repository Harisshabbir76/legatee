import { redirect } from "next/navigation";
import { checkAuth, fetchEmailMarketing } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import EmailMarketingClient from "../_components/EmailMarketingClient";

export default async function EmailMarketingPage() {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }

  const data = await fetchEmailMarketing();

  return (
    <AdminShell title="Email Marketing">
      <EmailMarketingClient data={data} />
    </AdminShell>
  );
}
