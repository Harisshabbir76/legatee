import { redirect } from "next/navigation";
import { checkAuth, fetchShippingPrice } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import ShippingManager from "../_components/ShippingManager";

export default async function ShippingPage() {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }

  const price = await fetchShippingPrice();

  return (
    <AdminShell title="Shipping">
      <ShippingManager initialPrice={price} />
    </AdminShell>
  );
}
