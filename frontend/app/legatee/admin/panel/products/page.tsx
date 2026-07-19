import Link from "next/link";
import { redirect } from "next/navigation";
import { checkAuth, fetchProducts } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import ProductCatalog from "../_components/ProductCatalog";

export default async function ProductCatalogPage() {
  if (!(await checkAuth())) {
    redirect("/legatee/admin/panel");
  }

  const products = await fetchProducts();

  return (
    <AdminShell
      title="Catalog"
      actions={
        <Link
          href="/legatee/admin/panel/products/new"
          className="rounded-md bg-maroon px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Add product
        </Link>
      }
    >
      <ProductCatalog products={products} />
    </AdminShell>
  );
}
