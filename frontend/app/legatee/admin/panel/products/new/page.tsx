import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/api";
import AdminShell from "../../_components/AdminShell";
import ProductForm from "../../_components/ProductForm";

export default async function NewProductPage() {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }

  return (
    <AdminShell title="Add product">
      <div className="mx-auto max-w-3xl">
        <ProductForm />
      </div>
    </AdminShell>
  );
}
