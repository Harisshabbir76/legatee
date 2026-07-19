import { redirect } from "next/navigation";
import { checkAuth, fetchLegalPageContent, fetchFooterContent } from "@/lib/api";
import LegalPageEditorClient from "./LegalPageEditorClient";

export default async function LegalEditorPage() {
  const auth = await checkAuth();
  if (!auth) redirect("/legatee/admin/panel");
  const [content, footerContent] = await Promise.all([fetchLegalPageContent(), fetchFooterContent()]);
  return <LegalPageEditorClient initialContent={content} initialFooterContent={footerContent} />;
}
