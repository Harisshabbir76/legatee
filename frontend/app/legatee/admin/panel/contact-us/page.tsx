import { redirect } from "next/navigation";
import { checkAuth, fetchContactPageContent, fetchFooterContent } from "@/lib/api";
import ContactPageEditorClient from "./ContactPageEditorClient";

export default async function ContactEditorPage() {
  const auth = await checkAuth();
  if (!auth) redirect("/legatee/admin/panel");
  const [content, footerContent] = await Promise.all([fetchContactPageContent(), fetchFooterContent()]);
  return <ContactPageEditorClient initialContent={content} initialFooterContent={footerContent} />;
}
