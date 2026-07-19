import AboutHero from "../components/our-story/AboutHero";
import HeritageStory from "../components/our-story/HeritageStory";
import Mission from "../components/our-story/mission";
import Values from "../components/our-story/values";
import Marquee from "../components/our-story/Marquee";
import styles from "../styles/AboutPage.module.css";

export default async function AboutUsPage() {
  return (
    <main className={styles.main}>
      <AboutHero />
      <HeritageStory />
      <Mission />
      <Values />
      <Marquee />
    </main>
  );
}
