import BodyhairmistHero from "../components/shop/bodyhairmistHero";
import ShopProducts from "../components/shop/ShopProducts";
import GotQuestions from "../components/shop/GotQuestions";
import { fetchProducts } from "@/lib/api";
import styles from "../styles/ShopPage.module.css";

const KEYWORDS = ["body", "hair", "mist"];

export default async function ShopPage() {
  const allProducts = await fetchProducts();
  const products = allProducts.filter((product) => {
    const name = product.category?.name.toLowerCase();
    return name ? KEYWORDS.some((keyword) => name.includes(keyword)) : false;
  });

  return (
    <main className={styles.main}>
      <BodyhairmistHero />
      <ShopProducts products={products} showCategoryFilter={false} />
      <GotQuestions />
    </main>
  );
}
