"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { OrderStatus } from "@/lib/api";
import styles from "@/app/styles/dashboard styling/orders.module.css";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "out for delivery", "delivered", "cancelled"];

export default function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as OrderStatus;
    setValue(next);
    startTransition(async () => {
      await adminFetch(`${API_URL}/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...adminAuthHeader() },
        body: JSON.stringify({ status: next }),
      });
      router.refresh();
    });
  }

  return (
    <select value={value} disabled={isPending} onChange={handleChange} className={styles.statusSelect}>
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
