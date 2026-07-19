import HeroSection from "./components/home/HeroSection";
import HeritageStory from "./components/home/HeritageStory";
import BrandQuote from "./components/home/BrandQuote";
import OurCollection from "./components/home/OurCollection";
import LovedProducts from "./components/home/LovedProducts";
import WhyLegatee from "./components/home/WhyLegatee";
import styles from "./styles/HomePage.module.css";
import Marquee from "./components/our-story/Marquee";
import { fetchCollections, fetchHomepageProducts, fetchHomepageContent } from "@/lib/api";

export default async function Home() {
  const [collections, products, cms] = await Promise.all([
    fetchCollections(),
    fetchHomepageProducts(),
    fetchHomepageContent(),
  ]);

  return (
    <main className={styles.main}>
      <HeroSection     content={cms?.hero} />
      <HeritageStory   content={cms?.heritage} />
      <OurCollection   content={cms?.collection} collections={collections} />
      <LovedProducts   content={cms?.lovedProducts} products={products} />
      <BrandQuote      content={cms?.brandQuote} />
      <WhyLegatee      content={cms?.whyChoose} />
      <Marquee />
    </main>
  );
}
