import { notFound, redirect } from "next/navigation";
import { checkAuth, fetchProduct } from "@/lib/api";
import AdminShell from "../../../_components/AdminShell";
import ProductForm from "../../../_components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }

  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell title="Edit product">
      <div className="mx-auto max-w-3xl">
        <ProductForm product={product} />
      </div>
    </AdminShell>
  );
}
