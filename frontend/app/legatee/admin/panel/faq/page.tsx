import { redirect } from "next/navigation";
import { checkAuth, fetchFaqPageContent, fetchFooterContent } from "@/lib/api";
import FaqPageEditorClient from "./FaqPageEditorClient";

export default async function FaqEditorPage() {
  const auth = await checkAuth();
  if (!auth) redirect("/legatee/admin/panel");
  const [content, footerContent] = await Promise.all([fetchFaqPageContent(), fetchFooterContent()]);
  return <FaqPageEditorClient initialContent={content} initialFooterContent={footerContent} />;
}
