import Faq from "../components/Faq/Faq";
import { fetchFaqPageContent } from "@/lib/api";

export default async function FaqPage() {
  const content = await fetchFaqPageContent();
  return (
    <main>
      <Faq content={content} />
    </main>
  );
}
