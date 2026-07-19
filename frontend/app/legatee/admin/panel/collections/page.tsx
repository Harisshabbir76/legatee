import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/api";
import { API_URL } from "@/lib/api-client";
import type { Collection } from "@/lib/api";
import AdminShell from "../_components/AdminShell";
import CollectionManager from "../_components/CollectionManager";

async function fetchCollectionsAdmin(): Promise<Collection[]> {
  try {
    const res = await fetch(`${API_URL}/api/collections`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.collections as Collection[];
  } catch {
    return [];
  }
}

export default async function CollectionsPage() {
  if (!(await checkAuth())) redirect("/legatee/admin/panel");

  const collections = await fetchCollectionsAdmin();

  return (
    <AdminShell title="Collections">
      <CollectionManager collections={collections} />
    </AdminShell>
  );
}
