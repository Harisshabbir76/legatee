"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import ConfirmModal from "./ConfirmModal";
import styles from "@/app/styles/dashboard styling/shared.module.css";

export default function DeleteProductButton({
  id,
  onDeleting,
  onDeleteFailed,
}: {
  id: string;
  onDeleting?: () => void;
  onDeleteFailed?: () => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setConfirmOpen(false);
    onDeleting?.();
    startTransition(async () => {
      try {
        const res = await adminFetch(`${API_URL}/api/products/${id}`, { method: "DELETE", headers: adminAuthHeader() });
        if (!res.ok) throw new Error(`Delete failed (${res.status})`);
      } catch {
        onDeleteFailed?.();
        alert("Could not delete the product. Please try again.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setConfirmOpen(true)}
        className={styles.btnDanger}
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>

      <ConfirmModal
        open={confirmOpen}
        title="Delete this product?"
        message="The product will be removed from the catalog and the storefront. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
