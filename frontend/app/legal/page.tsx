import Legal from "../components/legal/Legal";
import Marque from "../components/our-story/Marquee";
import { fetchLegalPageContent } from "@/lib/api";

export default async function LegalPage() {
  const content = await fetchLegalPageContent();
  return (
    <main>
      <Legal content={content} />
      <Marque />
    </main>
  );
}
