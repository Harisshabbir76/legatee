import { checkAuth, fetchProducts } from "@/lib/api";
import { redirect } from "next/navigation";
import ShopPageEditorClient from "../shop/ShopPageEditorClient";
import { API_URL } from "@/lib/api-client";

export default async function PerfumesEditorPage() {
  const authenticated = await checkAuth();
  if (!authenticated) redirect("/legatee/admin/panel");

  let initialContent = null;
  let initialFooterContent = null;
  try {
    const [pageRes, footerRes] = await Promise.all([
      fetch(`${API_URL}/api/shoppage`, { cache: "no-store" }),
      fetch(`${API_URL}/api/footer`,   { cache: "no-store" }),
    ]);
    if (pageRes.ok)   initialContent       = (await pageRes.json()).content;
    if (footerRes.ok) initialFooterContent = (await footerRes.json()).content;
  } catch {}

  const allProducts = await fetchProducts();
  const products = allProducts.filter((p) =>
    p.category?.name.toLowerCase().includes("perfume")
  );

  return <ShopPageEditorClient pageKey="perfumes" initialContent={initialContent} initialProducts={products} initialFooterContent={initialFooterContent} />;
}
