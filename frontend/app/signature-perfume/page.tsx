import CollectionShopHero from "../components/shop/CollectionShopHero";
import ShopProducts from "../components/shop/ShopProducts";
import GotQuestions from "../components/shop/GotQuestions";
import WhyLegatee from "../components/home/WhyLegatee";
import Marquee from "../components/our-story/Marquee";
import { fetchProducts, fetchCollections, fetchShopPageContent } from "@/lib/api";
import styles from "../styles/ShopPage.module.css";

export default async function SignaturePerfumePage() {
  const [allProducts, collections, shopContent] = await Promise.all([fetchProducts(), fetchCollections(), fetchShopPageContent()]);

  const signatureCollection = collections.find((c) =>
    c.name.toLowerCase().includes("signature")
  );

  const products = signatureCollection
    ? allProducts.filter((p) => p.collection?.id === signatureCollection.id)
    : allProducts.filter((p) =>
        p.collection?.name.toLowerCase().includes("signature") ||
        p.category?.name.toLowerCase().includes("signature")
      );

  return (
    <main className={styles.main}>
      <CollectionShopHero collectionId="signature" content={shopContent?.signature?.hero} />
      <ShopProducts products={products} collections={[]} collectionSlug="signature-perfume" />
      <GotQuestions />
      <WhyLegatee />
      <Marquee />
    </main>
  );
}
