import { redirect } from "next/navigation";
import { checkAuth, fetchCoupons } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import CouponManager from "../_components/CouponManager";

export default async function CouponsPage() {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }

  const coupons = await fetchCoupons();

  return (
    <AdminShell title="Coupons">
      <CouponManager initialCoupons={coupons} />
    </AdminShell>
  );
}
