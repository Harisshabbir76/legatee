import Image, { type StaticImageData } from "next/image";
import styles from "../styles/ProductCard.module.css";

export type Product = {
  name: string;
  price: string;
  image: StaticImageData;
};

export default function ProductCard({
  product,
  layout = "grid",
}: {
  product: Product;
  layout?: "grid" | "list";
}) {
  if (layout === "list") {
    return (
      <div className={styles.listCard}>
        <div className={styles.listImageWrap}>
          <Image
            src={product.image}
            alt={product.name}
            className={styles.listImage}
            sizes="96px"
            placeholder="blur"
          />
        </div>
        <div className={styles.listInfo}>
          <h3 className={styles.listName}>{product.name}</h3>
          <p className={styles.listPrice}>{product.price}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={product.image}
          alt={product.name}
          className={styles.image}
          sizes="(max-width: 280px) 80vw, 280px"
          placeholder="blur"
        />
      </div>
      <h3 className={styles.name}>
        {product.name}
      </h3>
      <p className={styles.price}>
        {product.price}
      </p>
    </div>
  );
}
