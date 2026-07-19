import { checkAuth } from "@/lib/api";
import { redirect } from "next/navigation";
import HomepageEditorClient from "./HomepageEditorClient";
import { API_URL } from "@/lib/api-client";

export default async function HomepageEditorPage() {
  const authenticated = await checkAuth();
  if (!authenticated) redirect("/legatee/admin/panel");

  let initialContent = null;
  let initialFooterContent = null;
  try {
    const [pageRes, footerRes] = await Promise.all([
      fetch(`${API_URL}/api/homepage`, { cache: "no-store" }),
      fetch(`${API_URL}/api/footer`,   { cache: "no-store" }),
    ]);
    if (pageRes.ok)   initialContent       = (await pageRes.json()).content;
    if (footerRes.ok) initialFooterContent = (await footerRes.json()).content;
  } catch {}

  return <HomepageEditorClient initialContent={initialContent} initialFooterContent={initialFooterContent} />;
}
