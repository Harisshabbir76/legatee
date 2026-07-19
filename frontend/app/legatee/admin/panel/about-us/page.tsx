import { redirect } from "next/navigation";
import { checkAuth, fetchAboutPageContent, fetchFooterContent } from "@/lib/api";
import AboutPageEditorClient from "./AboutPageEditorClient";

export default async function AboutUsEditorPage() {
  const auth = await checkAuth();
  if (!auth) redirect("/legatee/admin/panel");
  const [content, footerContent] = await Promise.all([fetchAboutPageContent(), fetchFooterContent()]);
  return <AboutPageEditorClient initialContent={content} initialFooterContent={footerContent} />;
}
