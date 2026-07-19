import ContactUsForm from "./ContactUsForm";
import ContactUsHero from "./ContactUsHero";
import InstagramSection from "./InstagramSection";
import type { ContactPageData } from "@/lib/api";

export default function ContactUs({ content }: { content?: ContactPageData | null }) {
  return (
    <>
      <ContactUsHero content={content} />
      <ContactUsForm content={content} />
      <InstagramSection />
    </>
  );
}
