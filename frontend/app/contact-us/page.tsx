import ContactUs from "../components/contact-us/ContactUs";
import Morque from "../components/our-story/Marquee";
import { fetchContactPageContent } from "@/lib/api";

export default async function ContactUsPage() {
  const content = await fetchContactPageContent();
  return (
    <main>
      <ContactUs content={content} />
      <Morque />
    </main>
  );
}
