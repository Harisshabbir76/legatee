"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import shippingStyles from "@/app/styles/dashboard styling/shipping.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

const styles = { ...shippingStyles, ...sharedStyles };

export default function ShippingManager({ initialPrice }: { initialPrice: number }) {
  const router = useRouter();
  const [price, setPrice] = useState(String(initialPrice));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"saved" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    setError(null);
    try {
      const res = await adminFetch(`${API_URL}/api/shipping`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...adminAuthHeader() },
        body: JSON.stringify({ price: Number(price) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Could not save the shipping price.");
        return;
      }
      const data = await res.json();
      setPrice(String(data.price));
      setStatus("saved");
      router.refresh();
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.shippingPage}>
      <form onSubmit={handleSubmit} className={styles.shippingCard}>
        <div>
          <h2 className={styles.shippingTitle}>Flat shipping price</h2>
          <p className={styles.shippingHint}>
            Charged on every order at checkout and added to the order total. Set 0 for free
            shipping.
          </p>
        </div>

        <label className={styles.shippingField}>
          Shipping price (AED)
          <input
            type="number"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={styles.shippingInput}
          />
        </label>

        {error && <p className={styles.formError} role="alert">{error}</p>}
        {status === "saved" && <p className={styles.shippingSaved}>✓ Shipping price saved.</p>}

        <div className={styles.shippingActions}>
          <button type="submit" disabled={saving} className={styles.btnPrimary}>
            {saving ? "Saving..." : "Save shipping price"}
          </button>
        </div>
      </form>

      <div className={styles.shippingPreview}>
        <h3 className={styles.shippingPreviewTitle}>How it appears at checkout</h3>
        <div className={styles.shippingPreviewRow}>
          <span>Subtotal</span>
          <span>1,000 AED</span>
        </div>
        <div className={styles.shippingPreviewRow}>
          <span>Shipping</span>
          <span>
            {Number(price) > 0 ? `${Number(price).toLocaleString("en-US")} AED` : "Free"}
          </span>
        </div>
        <div className={`${styles.shippingPreviewRow} ${styles.shippingPreviewTotal}`}>
          <span>Total</span>
          <span>{(1000 + (Number(price) || 0)).toLocaleString("en-US")} AED</span>
        </div>
      </div>
    </div>
  );
}
