"use client";

import { useEffect, useMemo, useState } from "react";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { Order, OrderStatus } from "@/lib/api";
import DateFilterBar, {
  EMPTY_DATE_FILTER,
  matchesDateFilter,
  type DateFilter,
} from "./DateFilterBar";
import orderStyles from "@/app/styles/dashboard styling/orders.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

// Merge both style objects so existing JSX (styles.xxx) keeps working
const styles = { ...orderStyles, ...sharedStyles };

const STATUSES: OrderStatus[] = ["pending", "confirmed", "out for delivery", "delivered", "cancelled"];

type TabKey = "all" | "pending" | "confirmed" | "out for delivery" | "delivered" | "cancelled";

const TABS: { key: TabKey; label: string; status?: OrderStatus }[] = [
  { key: "all",              label: "All" },
  { key: "pending",          label: "Pending",          status: "pending" },
  { key: "confirmed",        label: "Confirmed",        status: "confirmed" },
  { key: "out for delivery", label: "Out for Delivery", status: "out for delivery" },
  { key: "delivered",        label: "Delivered",        status: "delivered" },
  { key: "cancelled",        label: "Cancelled",        status: "cancelled" },
];

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString("en-US")} AED`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const PAYMENT_LABELS: Record<string, string> = {
  tabby: "Tabby (Pay in 4)",
  tamara: "Tamara",
  card: "Card",
};

function paymentMethodLabel(order: Order): string {
  const method = order.payment?.method ?? "";
  if (!method) return "—";
  return PAYMENT_LABELS[method] ?? method;
}

function paymentStatusLabel(order: Order): string {
  const status = order.payment?.status ?? "";
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "—";
}

export default function OrdersManager({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tab, setTab] = useState<TabKey>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>(EMPTY_DATE_FILTER);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<OrderStatus>("confirmed");
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    const tabStatus = TABS.find((t) => t.key === tab)?.status;
    return orders.filter(
      (o) => (!tabStatus || o.status === tabStatus) && matchesDateFilter(o.createdAt, dateFilter)
    );
  }, [orders, tab, dateFilter]);

  const detailsOrder = detailsId ? orders.find((o) => o.id === detailsId) ?? null : null;

  // Close the details modal on Escape
  useEffect(() => {
    if (!detailsId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDetailsId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailsId]);

  function tabCount(key: TabKey): number {
    const status = TABS.find((t) => t.key === key)?.status;
    if (!status) return orders.length;
    return orders.filter((o) => o.status === status).length;
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allVisibleSelected = visible.length > 0 && visible.every((o) => selected.has(o.id));

  function toggleSelectAll() {
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        visible.forEach((o) => next.delete(o.id));
        return next;
      }
      return new Set([...prev, ...visible.map((o) => o.id)]);
    });
  }

  async function updateStatus(ids: string[], status: OrderStatus) {
    setBusy(true);
    setError(null);
    const updated: string[] = [];
    try {
      for (const id of ids) {
        const res = await adminFetch(`${API_URL}/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...adminAuthHeader() },
          body: JSON.stringify({ status }),
        });
        if (res.ok) updated.push(id);
      }
      if (updated.length < ids.length) {
        setError("Some orders could not be updated. Please try again.");
      }
      if (updated.length > 0) {
        setOrders((prev) => prev.map((o) => (updated.includes(o.id) ? { ...o, status } : o)));
      }
    } catch {
      setError("Could not reach the server. Is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  async function applyBulk() {
    const ids = [...selected];
    if (ids.length === 0) return;
    await updateStatus(ids, bulkStatus);
    setSelected(new Set());
  }

  return (
    <div className={styles.ordersPage}>
      {/* ── Date filters (on top) ── */}
      <DateFilterBar value={dateFilter} onChange={setDateFilter} />

      {/* ── Status tabs ── */}
      <div className={styles.tabsRow} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ""}`}
          >
            {t.label}
            <span className={styles.tabCount}>{tabCount(t.key)}</span>
          </button>
        ))}
      </div>

      {/* ── Bulk actions ── */}
      {selected.size > 0 && (
        <div className={styles.bulkBar}>
          <span className={styles.bulkCount}>{selected.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
            className={styles.statusSelect}
            disabled={busy}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button type="button" onClick={applyBulk} disabled={busy} className={styles.btnPrimary}>
            {busy ? "Updating..." : "Apply status"}
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            disabled={busy}
            className={styles.btnOutline}
          >
            Clear selection
          </button>
        </div>
      )}

      {error && <p className={styles.formError} role="alert">{error}</p>}

      {/* ── Orders list (scrolls inside its own full-screen panel) ── */}
      {visible.length === 0 ? (
        <p className={styles.empty}>No orders match these filters.</p>
      ) : (
        <div className={`${styles.tableWrap} ${styles.ordersScroll}`}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr className={styles.tr}>
                <th className={`${styles.th} ${styles.thCheck}`}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all visible orders"
                    className={styles.rowCheckbox}
                  />
                </th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Items</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Details</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {visible.map((order) => (
                <tr key={order.id} className={styles.tr}>
                  <td data-label="Select" className={`${styles.td} ${styles.tdCheck}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(order.id)}
                      onChange={() => toggleSelected(order.id)}
                      aria-label={`Select order from ${order.customer.name}`}
                      className={styles.rowCheckbox}
                    />
                  </td>
                  <td data-label="Date" className={`${styles.td} ${styles.tdMuted}`}>
                    {formatDate(order.createdAt)}
                  </td>
                  <td data-label="Customer" className={styles.td}>
                    <p className={styles.customerName}>{order.customer.name}</p>
                    <p className={styles.customerEmail}>{order.customer.email}</p>
                  </td>
                  <td data-label="Items" className={`${styles.td} ${styles.tdMuted}`}>
                    {order.items.map((item) => (
                      <div key={item.id}>
                        {item.quantity}&times; {item.name}
                        {item.size ? ` (${item.size})` : ""}
                      </div>
                    ))}
                  </td>
                  <td data-label="Total" className={styles.td}>{formatCurrency(order.total)}</td>
                  <td data-label="Status" className={styles.td}>
                    <select
                      value={order.status}
                      disabled={busy}
                      onChange={(e) => updateStatus([order.id], e.target.value as OrderStatus)}
                      className={styles.statusSelect}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td data-label="Details" className={styles.td}>
                    <button
                      type="button"
                      onClick={() => setDetailsId(order.id)}
                      className={styles.btnOutline}
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Order details modal ── */}
      {detailsOrder && (
        <div className={styles.modalOverlay} onClick={() => setDetailsId(null)}>
          <div
            className={`${styles.modal} ${styles.orderModal}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Order details"
          >
            <div className={styles.orderModalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Order details</h2>
                <p className={styles.orderModalDate}>{formatDateTime(detailsOrder.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsId(null)}
                aria-label="Close order details"
                className={styles.orderModalClose}
              >
                &times;
              </button>
            </div>

            <div className={styles.orderModalSection}>
              <h3 className={styles.orderModalSectionTitle}>Customer</h3>
              <dl className={styles.orderInfoGrid}>
                <div className={styles.orderInfoItem}>
                  <dt>Name</dt>
                  <dd>{detailsOrder.customer.name}</dd>
                </div>
                <div className={styles.orderInfoItem}>
                  <dt>Email</dt>
                  <dd>{detailsOrder.customer.email}</dd>
                </div>
                <div className={styles.orderInfoItem}>
                  <dt>Phone</dt>
                  <dd>{detailsOrder.customer.phone}</dd>
                </div>
                <div className={styles.orderInfoItem}>
                  <dt>City</dt>
                  <dd>{detailsOrder.customer.city}</dd>
                </div>
                <div className={`${styles.orderInfoItem} ${styles.orderInfoItemWide}`}>
                  <dt>Address</dt>
                  <dd>{detailsOrder.customer.address}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.orderModalSection}>
              <h3 className={styles.orderModalSectionTitle}>Products</h3>
              <ul className={styles.orderItemsList}>
                {detailsOrder.items.map((item) => (
                  <li key={item.id} className={styles.orderItemRow}>
                    <div className={styles.orderItemInfo}>
                      <span className={styles.orderItemName}>{item.name}</span>
                      <span className={styles.orderItemMeta}>
                        Qty {item.quantity}
                        {item.size ? ` · ${item.size}` : ""}
                        {item.variants.map((v) => ` · ${v.name}: ${v.value}`).join("")}
                      </span>
                    </div>
                    <span className={styles.orderItemPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              {typeof detailsOrder.shipping === "number" && detailsOrder.shipping > 0 && (
                <div className={styles.orderShippingRow}>
                  <span>Shipping</span>
                  <span>{formatCurrency(detailsOrder.shipping)}</span>
                </div>
              )}
              <div className={styles.orderTotalRow}>
                <span>Total</span>
                <span>{formatCurrency(detailsOrder.total)}</span>
              </div>
            </div>

            <div className={styles.orderModalSection}>
              <h3 className={styles.orderModalSectionTitle}>Payment</h3>
              <dl className={styles.orderInfoGrid}>
                <div className={styles.orderInfoItem}>
                  <dt>Method</dt>
                  <dd>{paymentMethodLabel(detailsOrder)}</dd>
                </div>
                <div className={styles.orderInfoItem}>
                  <dt>Payment status</dt>
                  <dd>{paymentStatusLabel(detailsOrder)}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.orderModalSection}>
              <h3 className={styles.orderModalSectionTitle}>Order status</h3>
              <select
                value={detailsOrder.status}
                disabled={busy}
                onChange={(e) => updateStatus([detailsOrder.id], e.target.value as OrderStatus)}
                className={styles.statusSelect}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
