import { redirect } from "next/navigation";
import { checkAuth, fetchOrders } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import OrdersManager from "../_components/OrdersManager";

export default async function OrdersPage() {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }

  const orders = await fetchOrders();

  return (
    <AdminShell title="Orders">
      <OrdersManager initialOrders={orders} />
    </AdminShell>
  );
}
