import { checkAuth } from "@/lib/api";
import AdminLoginForm from "./_components/AdminLoginForm";
import AdminDashboard from "./_components/AdminDashboard";

export default async function AdminPanelPage() {
  const authenticated = await checkAuth();

  if (!authenticated) {
    return <AdminLoginForm />;
  }

  return <AdminDashboard />;
}
