import FaqHero from "./FaqHero";
import FaqHelp from "./FaqHelp";
import Marque from "../../components/our-story/Marquee";
import type { FaqPageData } from "@/lib/api";

interface Props {
  content?: FaqPageData | null;
}

export default function Faq({ content }: Props) {
  return (
    <>
      <FaqHero content={content} />
      <FaqHelp content={content} />
      <Marque />
    </>
  );
}
