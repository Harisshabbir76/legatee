import CollectionShopHero from "../components/shop/CollectionShopHero";
import ShopProducts from "../components/shop/ShopProducts";
import GotQuestions from "../components/shop/GotQuestions";
import WhyLegatee from "../components/home/WhyLegatee";
import Marquee from "../components/our-story/Marquee";
import { fetchProducts, fetchCollections, fetchShopPageContent } from "@/lib/api";
import styles from "../styles/ShopPage.module.css";

export default async function AllOverSprayPage() {
  const [allProducts, collections, shopContent] = await Promise.all([fetchProducts(), fetchCollections(), fetchShopPageContent()]);

  const sprayCollection = collections.find((c) =>
    c.name.toLowerCase().includes("spray") || c.name.toLowerCase().includes("mist")
  );

  const products = sprayCollection
    ? allProducts.filter((p) => p.collection?.id === sprayCollection.id)
    : allProducts.filter((p) =>
        p.collection?.name.toLowerCase().includes("spray") ||
        p.collection?.name.toLowerCase().includes("mist") ||
        p.category?.name.toLowerCase().includes("spray") ||
        p.category?.name.toLowerCase().includes("mist")
      );

  return (
    <main className={styles.main}>
      <CollectionShopHero collectionId="spray" content={shopContent?.allOverSpray?.hero} />
      <ShopProducts products={products} collections={[]} collectionSlug="all-over-spray" />
      <GotQuestions />
      <WhyLegatee />
      <Marquee />
    </main>
  );
}
