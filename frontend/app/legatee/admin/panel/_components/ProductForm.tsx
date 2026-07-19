"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product, Collection } from "@/lib/api";
import { API_URL } from "@/lib/api-client";
import { getCookie, ADMIN_COOKIE } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import IngredientsSection, { type IngredientDraft } from "./IngredientsSection";
import ProductImagesGallery, { type ImageSlot } from "./ProductImagesGallery";
import formStyles from "@/app/styles/dashboard styling/product-form.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

const styles = { ...formStyles, ...sharedStyles };


interface SizeRow {
  id: string;
  value: string;
}

function initSizes(product?: Product): SizeRow[] {
  return product?.sizes.map((value) => ({ id: crypto.randomUUID(), value })) ?? [];
}

function initIngredients(product?: Product): IngredientDraft[] {
  return (
    product?.ingredients.map((i) => ({
      id: crypto.randomUUID(),
      name: i.name,
      description: i.description ?? "",
    })) ?? []
  );
}

function initImages(product?: Product): ImageSlot[] {
  return product?.images.map((url) => ({ id: crypto.randomUUID(), url })) ?? [];
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
const [howToUse, setHowToUse] = useState(product?.howToUse ?? "");
  const [mood, setMood] = useState(product?.mood ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [stock, setStock] = useState(
    product && typeof product.stock === "number" ? String(product.stock) : ""
  );
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collection, setCollection] = useState(product?.collection?.id ?? "");

  useEffect(() => {
    fetch(`${API_URL}/api/collections`)
      .then((r) => r.ok ? r.json() : { collections: [] })
      .then((d) => setCollections(d.collections ?? []))
      .catch(() => {});
  }, []);
  const [sizes, setSizes] = useState<SizeRow[]>(() => initSizes(product));
  const [ingredients, setIngredients] = useState<IngredientDraft[]>(() => initIngredients(product));
  const [images, setImages] = useState<ImageSlot[]>(() => initImages(product));
  const [showOnHomepage, setShowOnHomepage] = useState(product?.showOnHomepage ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("howToUse", howToUse);
    formData.set("mood", mood);
    formData.set("price", price);
    formData.set("stock", stock);
    formData.set("collection", collection);
    formData.set("showOnHomepage", String(showOnHomepage));
    formData.set(
      "sizes",
      JSON.stringify(sizes.map((s) => s.value).filter((v) => v.trim()))
    );
    formData.set(
      "ingredientsMeta",
      JSON.stringify(ingredients.map((i) => ({ name: i.name, description: i.description })))
    );
    formData.set(
      "existingImages",
      JSON.stringify(images.filter((row) => row.url).map((row) => row.url))
    );
    images
      .filter((row) => row.file)
      .forEach((row, index) => {
        formData.set(`productImage_${index}`, row.file as File);
      });

    startTransition(async () => {
      try {
        const token = getCookie(ADMIN_COOKIE);
        if (!token) { setError("Not authenticated."); return; }

        const url = product
          ? `${API_URL}/api/products/${product.id}`
          : `${API_URL}/api/products`;

        const res = await adminFetch(url, {
          method: product ? "PUT" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message ?? "Could not save the product.");
          return;
        }

        router.push("/legatee/admin/panel/products");
        router.refresh();
      } catch {
        setError("Could not reach the server. Is the backend running?");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* ── Details ── */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Details</h3>

        <div className={styles.formSection}>
          {/* Name */}
          <label className={styles.field}>
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </label>

          {/* Collection */}
          <label className={styles.field}>
            Collection
            <select
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              className={styles.selectField}
            >
              <option value="">No collection</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {/* Description */}
          <label className={styles.field}>
            Description
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </label>

          {/* How to use */}
          <label className={styles.field}>
            How to use
            <textarea
              rows={3}
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              placeholder="e.g. Spray on pulse points after showering"
              className={styles.textarea}
            />
          </label>

          {/* Mood */}
          <label className={styles.field}>
            Mood
            <textarea
              rows={3}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g. Confident, fresh, warm — ideal for evening wear"
              className={styles.textarea}
            />
          </label>

          {/* Price */}
          <label className={styles.field}>
            Price (AED)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={styles.inputSm}
              style={{ borderRadius: 6, border: "1px solid var(--color-line)", padding: "8px 12px", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
          </label>

          {/* Stock */}
          <label className={styles.field}>
            Stock (quantity)
            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="e.g. 25"
              className={styles.inputSm}
              style={{ borderRadius: 6, border: "1px solid var(--color-line)", padding: "8px 12px", fontSize: 14, outline: "none", fontFamily: "inherit" }}
            />
            <span className={styles.fieldHint}>
              When stock reaches 0 the product shows as &quot;Out of stock&quot; on the website and cannot be purchased.
            </span>
          </label>
        </div>
      </section>

      {/* ── Product Images ── */}
      <section className={styles.card}>
        <ProductImagesGallery rows={images} onChange={setImages} />
      </section>

      {/* ── Sizes ── */}
      <section className={styles.card}>
        <div className={styles.sizesWrap}>
          <h3 className={styles.cardTitle}>Size</h3>
          <button
            type="button"
            onClick={() => setSizes((rows) => [...rows, { id: crypto.randomUUID(), value: "" }])}
            className={styles.btnText}
          >
            + Add size
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {sizes.map((row) => (
            <div key={row.id} className={styles.sizeRow}>
              <input
                type="text"
                placeholder="e.g. 50ml"
                value={row.value}
                onChange={(e) =>
                  setSizes((rows) =>
                    rows.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r))
                  )
                }
                className={styles.sizeInput}
              />
              <button
                type="button"
                onClick={() => setSizes((rows) => rows.filter((r) => r.id !== row.id))}
                className={styles.sizeRemove}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ingredients ── */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Ingredients</h3>
        <IngredientsSection rows={ingredients} onChange={setIngredients} />
      </section>

      {/* ── Homepage ── */}
      <section className={styles.card}>
        <h3 className={styles.cardTitle}>Homepage</h3>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={showOnHomepage}
            onChange={(e) => setShowOnHomepage(e.target.checked)}
            className={styles.checkboxLabel}
          />
          <span style={{ fontSize: 14, color: "var(--ink)" }}>Show on home page</span>
        </label>
        <p className={styles.checkboxHint}>
          When checked, this product appears in the &quot;Our Collection&quot; section on the home page.
        </p>
      </section>

      {error && (
        <p className={styles.formError} role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={styles.btnPrimary}
        style={{ alignSelf: "flex-start" }}
      >
        {isPending ? "Saving..." : product ? "Save changes" : "Save product"}
      </button>


    </form>
  );
}
