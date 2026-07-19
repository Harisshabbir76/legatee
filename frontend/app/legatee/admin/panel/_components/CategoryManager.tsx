"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { Category } from "@/lib/api";
import ConfirmModal from "./ConfirmModal";
import catStyles from "@/app/styles/dashboard styling/categories.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

const styles = { ...catStyles, ...sharedStyles };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const res = await adminFetch(`${API_URL}/api/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...adminAuthHeader() },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message ?? "Could not create the category.");
          return;
        }
        setName("");
        router.refresh();
      } catch {
        setError("Could not reach the server. Is the backend running?");
      }
    });
  }

  function startEdit(category: Category) {
    setError(null);
    setEditingId(category.id);
    setEditingName(category.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  function saveEdit(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await adminFetch(`${API_URL}/api/categories/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...adminAuthHeader() },
          body: JSON.stringify({ name: editingName }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message ?? "Could not rename the category.");
          return;
        }
        setEditingId(null);
        setEditingName("");
        router.refresh();
      } catch {
        setError("Could not reach the server. Is the backend running?");
      }
    });
  }

  function handleDelete(id: string) {
    setDeleteTarget(null);
    startTransition(async () => {
      await adminFetch(`${API_URL}/api/categories/${id}`, { method: "DELETE", headers: adminAuthHeader() });
      router.refresh();
    });
  }

  function triggerImageUpload(id: string) {
    uploadTargetId.current = id;
    fileInputRef.current?.click();
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = uploadTargetId.current;
    if (!file || !id) return;
    e.target.value = "";
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await adminFetch(`${API_URL}/api/categories/${id}/image`, {
        method: "POST",
        headers: adminAuthHeader(),
        body: fd,
      });
      if (!res.ok) { setError("Image upload failed."); return; }
      router.refresh();
    } catch {
      setError("Could not upload image.");
    } finally {
      setUploadingId(null);
      uploadTargetId.current = null;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />

      <form onSubmit={handleSubmit} className={styles.categoryForm}>
        <label className={styles.categoryFormField}>
          Category name
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Signature Perfumes"
            className={styles.input}
          />
        </label>
        <button type="submit" disabled={isPending} className={styles.btnPrimary}>
          {isPending ? "Saving..." : "Add category"}
        </button>
      </form>

      {error && <p className={styles.formError} role="alert">{error}</p>}

      {categories.length === 0 ? (
        <p className={styles.empty}>No categories yet. Add your first one above.</p>
      ) : (
        <ul className={styles.categoryList}>
          {categories.map((category) => (
            <li key={category.id} className={styles.categoryItem}>
              {/* Image thumbnail */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <div style={{ width: 52, height: 52, borderRadius: 4, overflow: "hidden", background: "#f5f0e8", flexShrink: 0 }}>
                  {category.image
                    ? <img src={category.image} alt={category.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#aaa", textAlign: "center" }}>No image</div>
                  }
                </div>

                {editingId === category.id ? (
                  <form
                    className={styles.categoryEditForm}
                    style={{ flex: 1 }}
                    onSubmit={(e) => { e.preventDefault(); saveEdit(category.id); }}
                  >
                    <input
                      type="text"
                      required
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className={`${styles.input} ${styles.categoryEditInput}`}
                    />
                    <div className={styles.categoryItemActions}>
                      <button type="submit" disabled={isPending} className={styles.btnPrimary}>
                        {isPending ? "Saving..." : "Save"}
                      </button>
                      <button type="button" onClick={cancelEdit} className={styles.btnOutline}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <span className={styles.categoryName}>{category.name}</span>
                )}
              </div>

              {editingId !== category.id && (
                <div className={styles.categoryItemActions}>
                  <button
                    type="button"
                    disabled={uploadingId === category.id}
                    onClick={() => triggerImageUpload(category.id)}
                    className={styles.btnOutline}
                  >
                    {uploadingId === category.id ? "Uploading..." : "Image"}
                  </button>
                  <button type="button" disabled={isPending} onClick={() => startEdit(category)} className={styles.btnOutline}>Edit</button>
                  <button type="button" disabled={isPending} onClick={() => setDeleteTarget(category)} className={styles.btnDanger}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this category?"
        message={deleteTarget ? `"${deleteTarget.name}" will be removed. Products in it will be left without a category.` : ""}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        danger
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
