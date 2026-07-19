import CollectionShopHero from "../components/shop/CollectionShopHero";
import ShopProducts from "../components/shop/ShopProducts";
import GotQuestions from "../components/shop/GotQuestions";
import WhyLegatee from "../components/home/WhyLegatee";
import Marquee from "../components/our-story/Marquee";
import { fetchProducts, fetchCollections, fetchShopPageContent } from "@/lib/api";
import styles from "../styles/ShopPage.module.css";

export default async function KandoraPerfumePage() {
  const [allProducts, collections, shopContent] = await Promise.all([fetchProducts(), fetchCollections(), fetchShopPageContent()]);

  const kandoraCollection = collections.find((c) =>
    c.name.toLowerCase().includes("kandora")
  );

  const products = kandoraCollection
    ? allProducts.filter((p) => p.collection?.id === kandoraCollection.id)
    : allProducts.filter((p) =>
        p.collection?.name.toLowerCase().includes("kandora") ||
        p.category?.name.toLowerCase().includes("kandora")
      );

  return (
    <main className={styles.main}>
      <CollectionShopHero collectionId="kandora" content={shopContent?.kandora?.hero} />
      <ShopProducts products={products} collections={[]} collectionSlug="kandora-perfume" />
      <GotQuestions />
      <WhyLegatee />
      <Marquee />
    </main>
  );
}
