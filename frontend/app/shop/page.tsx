import ShopHero from "../components/shop/ShopHero";
import ShopProducts from "../components/shop/ShopProducts";
import GotQuestions from "../components/shop/GotQuestions";
import WhyLegatee from "../components/home/WhyLegatee";
import Marquee from "../components/our-story/Marquee";
import { fetchProducts, fetchCollections, fetchShopPageContent } from "@/lib/api";
import styles from "../styles/ShopPage.module.css";

export default async function ShopPage() {
  const [products, collections, cms] = await Promise.all([fetchProducts(), fetchCollections(), fetchShopPageContent()]);

  return (
    <main className={styles.main}>
      <ShopHero />
      <ShopProducts products={products} collections={collections} />
      <GotQuestions content={cms?.faq} />
      <WhyLegatee />
      <Marquee />
    </main>
  );
}
