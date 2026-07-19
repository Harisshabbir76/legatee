"use client";

import Link from "next/link";
import { useWishlist } from "../components/WishlistContext";
import { useCart } from "../components/CartContext";
import { productPath } from "@/lib/product-slug";
import cardStyles from "../styles/ProductCard.module.css";
import styles from "../styles/Wishlist.module.css";
import { useLanguage } from "../components/LanguageContext";
import { getT } from "@/lib/translations";

export default function WishlistPage() {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const { lang } = useLanguage();
  const t = getT(lang);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>{t.wishlistPage.title}</h1>

      {wishlistItems.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{t.wishlistPage.empty}</p>
          <Link href="/shop" className={styles.shopLink}>
            {t.wishlistPage.continueShopping}
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {wishlistItems.map((product) => {
            const image = product.images?.[0];
            const price = `${product.price.toLocaleString("en-US")} AED`;
            const href = productPath(product);

            return (
              <div key={product.id} className={styles.item}>
                <Link href={href} className={cardStyles.card}>
                  <div className={cardStyles.imageWrap}>
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image}
                        alt={product.name}
                        className={cardStyles.image}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className={cardStyles.image} />
                    )}
                  </div>
                  <h3 className={cardStyles.name}>{product.name}</h3>
                  <p className={cardStyles.price}>{price}</p>
                </Link>

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => {
                      addItem({
                        productId: product.id,
                        name: product.name,
                        image: product.images?.[0],
                        price: product.price,
                        size: product.sizes?.[0] || undefined,
                        variants: [],
                        quantity: 1,
                      });
                    }}
                    className={styles.addBtn}
                  >
                    {t.wishlistPage.addToCart}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className={styles.removeBtn}
                  >
                    {t.wishlistPage.remove}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
