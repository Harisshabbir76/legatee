"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Coupon } from "@/lib/api";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import ConfirmModal from "./ConfirmModal";
import couponStyles from "@/app/styles/dashboard styling/coupons.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

const styles = { ...couponStyles, ...sharedStyles };

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dubai",
  });
}

export default function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [startsAt, setStartsAt] = useState(todayISO);
  const [startTime, setStartTime] = useState("00:00");
  const [expiresAt, setExpiresAt] = useState("");
  const [endTime, setEndTime] = useState("23:59");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null);
  // Captured once on mount — only used to label coupons as active/expired.
  const [now] = useState(() => Date.now());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await adminFetch(`${API_URL}/api/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminAuthHeader() },
        body: JSON.stringify({
          code,
          discountPercent: Number(discountPercent),
          startsAt: `${startsAt}T${startTime}`,
          expiresAt: `${expiresAt}T${endTime}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message ?? "Could not create the coupon.");
        return;
      }
      setCoupons((prev) => [data.coupon, ...prev]);
      setCode("");
      setDiscountPercent("");
      setStartsAt(todayISO());
      setStartTime("00:00");
      setExpiresAt("");
      setEndTime("23:59");
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const coupon = pendingDelete;
    setPendingDelete(null);
    if (!coupon) return;
    try {
      const res = await adminFetch(`${API_URL}/api/coupons/${coupon.id}`, {
        method: "DELETE",
        headers: adminAuthHeader(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Could not delete the coupon.");
        return;
      }
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      router.refresh();
    } catch {
      setError("Could not reach the server. Is the backend running?");
    }
  }

  return (
    <div className={styles.couponPage}>
      <form onSubmit={handleSubmit} className={styles.couponCard}>
        <div>
          <h2 className={styles.couponTitle}>Create a coupon</h2>
          <p className={styles.couponHint}>
            Customers enter the code at checkout. The discount percentage is taken off their order
            total. The coupon works between the start and end date &amp; time (UAE time).
          </p>
        </div>

        <label className={styles.couponField}>
          Coupon code
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ""))}
            placeholder="e.g. WELCOME10"
            maxLength={32}
            className={styles.couponInput}
          />
        </label>

        <label className={styles.couponField}>
          Discount percentage (%)
          <input
            type="number"
            min="1"
            max="100"
            step="0.01"
            required
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            placeholder="e.g. 10"
            className={styles.couponInput}
          />
        </label>

        <div className={styles.couponRow}>
          <label className={styles.couponField}>
            Start date
            <input
              type="date"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={styles.couponInput}
            />
          </label>

          <label className={styles.couponField}>
            Start time
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles.couponInput}
            />
          </label>
        </div>

        <div className={styles.couponRow}>
          <label className={styles.couponField}>
            End date
            <input
              type="date"
              required
              min={startsAt > todayISO() ? startsAt : todayISO()}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className={styles.couponInput}
            />
          </label>

          <label className={styles.couponField}>
            End time
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={styles.couponInput}
            />
          </label>
        </div>

        {error && <p className={styles.formError} role="alert">{error}</p>}
        {saved && <p className={styles.couponSaved}>✓ Coupon created.</p>}

        <div className={styles.couponActions}>
          <button type="submit" disabled={saving} className={styles.btnPrimary}>
            {saving ? "Creating..." : "Create coupon"}
          </button>
        </div>
      </form>

      <div className={styles.couponCard}>
        <h2 className={styles.couponTitle}>All coupons</h2>
        {coupons.length === 0 ? (
          <p className={styles.couponHint}>No coupons yet.</p>
        ) : (
          <div className={styles.couponTableWrap}>
            <table className={styles.couponTable}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Starts</th>
                  <th>Ends</th>
                  <th>Status</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expired = new Date(c.expiresAt).getTime() < now;
                  const scheduled = !!c.startsAt && new Date(c.startsAt).getTime() > now;
                  return (
                    <tr key={c.id}>
                      <td className={styles.couponCode}>{c.code}</td>
                      <td>{c.discountPercent}%</td>
                      <td>{c.startsAt ? formatDate(c.startsAt) : "—"}</td>
                      <td>{formatDate(c.expiresAt)}</td>
                      <td>
                        <span className={expired ? styles.badgeExpired : scheduled ? styles.badgeScheduled : styles.badgeActive}>
                          {expired ? "Expired" : scheduled ? "Scheduled" : "Active"}
                        </span>
                      </td>
                      <td className={styles.couponCellActions}>
                        <button type="button" className={styles.btnDanger} onClick={() => setPendingDelete(c)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        title="Delete coupon?"
        message={`The coupon "${pendingDelete?.code ?? ""}" will stop working immediately.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
