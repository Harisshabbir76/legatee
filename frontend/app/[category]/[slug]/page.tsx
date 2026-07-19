import { notFound } from "next/navigation";
import ProductDetailsHero from "../../components/product-description/ProductDetailsHero";
import FragranceComposition from "../../components/product-description/FragranceComposition";
import ProductIngredients from "../../components/product-description/ProductIngredients";
import styles from "../../components/product-description/ProductDescription.module.css";
import LovedProducts from "../../components/home/LovedProducts";
import GotQuestions from "../../components/shop/GotQuestions";
import Whylegatee from "../../components/home/WhyLegatee"; 
import { fetchProductBySlug, fetchHomepageProducts } from "@/lib/api";

function slugToLabel(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const [product, homepageProducts] = await Promise.all([
    fetchProductBySlug(slug),
    fetchHomepageProducts(),
  ]);

  if (!product) {
    notFound();
  }

  const categoryLabel = slugToLabel(category);

  return (
    <main className={styles.page}>
      <ProductDetailsHero product={product} categoryLabel={categoryLabel} categorySlug={category} />
      <LovedProducts products={homepageProducts} />
      <GotQuestions />
      <Whylegatee />
    </main>
  );
}
