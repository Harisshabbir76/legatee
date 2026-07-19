"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-client";
import { adminAuthHeader } from "@/lib/token";
import { adminFetch } from "@/lib/admin-fetch";
import type { Collection } from "@/lib/api";
import ConfirmModal from "./ConfirmModal";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";
import catStyles from "@/app/styles/dashboard styling/categories.module.css";

const styles = { ...catStyles, ...sharedStyles };

export default function CollectionManager({ collections }: { collections: Collection[] }) {
  const router = useRouter();

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const createFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<string | null>(null);

  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        // 1. Create collection
        const res = await adminFetch(`${API_URL}/api/collections`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...adminAuthHeader() },
          body: JSON.stringify({ name, description }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message ?? "Could not create the collection.");
          return;
        }
        const { collection } = await res.json();

        // 2. Upload image if selected
        if (imageFile) {
          const fd = new FormData();
          fd.append("image", imageFile);
          const imgRes = await adminFetch(`${API_URL}/api/collections/${collection.id}/image`, {
            method: "POST",
            headers: adminAuthHeader(),
            body: fd,
          });
          if (!imgRes.ok) {
            setError("Collection created but image upload failed. Use 'Add Image' to retry.");
          }
        }

        setName("");
        setDescription("");
        setImageFile(null);
        setPreviewUrl(null);
        router.refresh();
      } catch {
        setError("Could not reach the server. Is the backend running?");
      }
    });
  }

  function saveEdit(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await adminFetch(`${API_URL}/api/collections/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...adminAuthHeader() },
          body: JSON.stringify({ name: editingName, description: editingDescription }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message ?? "Could not update the collection.");
          return;
        }
        setEditingId(null);
        router.refresh();
      } catch {
        setError("Could not reach the server.");
      }
    });
  }

  function handleDelete(id: string) {
    setDeleteTarget(null);
    startTransition(async () => {
      await adminFetch(`${API_URL}/api/collections/${id}`, { method: "DELETE", headers: adminAuthHeader() });
      router.refresh();
    });
  }

  function triggerImageUpload(id: string) {
    uploadTargetId.current = id;
    editFileRef.current?.click();
  }

  async function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = uploadTargetId.current;
    if (!file || !id) return;
    e.target.value = "";
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await adminFetch(`${API_URL}/api/collections/${id}/image`, {
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
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Hidden file inputs */}
      <input ref={createFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagePick} />
      <input ref={editFileRef}   type="file" accept="image/*" style={{ display: "none" }} onChange={handleEditImageChange} />

      {/* ── Create form ── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, background: "#faf7f1", padding: 20, borderRadius: 8 }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#3B1814" }}>Add New Collection</h3>

        <label className={styles.categoryFormField}>
          Name *
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Signature Perfumes"
            className={styles.input}
          />
        </label>

        <label className={styles.categoryFormField}>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of this collection…"
            rows={2}
            style={{ width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "6px 8px", fontSize: 12, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </label>

        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#6f6459", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Image</div>
          {previewUrl && (
            <img src={previewUrl} alt="preview" style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4, display: "block", marginBottom: 8 }} />
          )}
          <button
            type="button"
            onClick={() => createFileRef.current?.click()}
            className={styles.btnOutline}
            style={{ fontSize: 12 }}
          >
            {previewUrl ? "Change image" : "Select image"}
          </button>
        </div>

        <button type="submit" disabled={isPending} className={styles.btnPrimary} style={{ alignSelf: "flex-start" }}>
          {isPending ? "Saving..." : "Add collection"}
        </button>
      </form>

      {error && <p className={styles.formError} role="alert">{error}</p>}

      {/* ── List ── */}
      {collections.length === 0 ? (
        <p className={styles.empty}>No collections yet. Add your first one above.</p>
      ) : (
        <ul className={styles.categoryList}>
          {collections.map((col) => (
            <li key={col.id} className={styles.categoryItem} style={{ flexDirection: "column", alignItems: "stretch", gap: 0 }}>
              {editingId === col.id ? (
                <form
                  style={{ display: "flex", flexDirection: "column", gap: 10, padding: "8px 0" }}
                  onSubmit={(e) => { e.preventDefault(); saveEdit(col.id); }}
                >
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className={styles.input}
                    placeholder="Collection name"
                  />
                  <textarea
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    style={{ width: "100%", border: "1px solid #d4c5b5", borderRadius: 4, padding: "6px 8px", fontSize: 12, resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={isPending} className={styles.btnPrimary}>{isPending ? "Saving..." : "Save"}</button>
                    <button type="button" onClick={() => setEditingId(null)} className={styles.btnOutline}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Thumbnail */}
                  <div style={{ width: 64, height: 64, borderRadius: 4, overflow: "hidden", background: "#173946", flexShrink: 0 }}>
                    {col.image
                      ? <img src={col.image} alt={col.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", opacity: 0.5 }}>No image</div>
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#3B1814" }}>{col.name}</div>
                    {col.description && <div style={{ fontSize: 11, color: "#888", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.description}</div>}
                  </div>

                  <div className={styles.categoryItemActions}>
                    <button
                      type="button"
                      disabled={uploadingId === col.id}
                      onClick={() => triggerImageUpload(col.id)}
                      className={styles.btnOutline}
                    >
                      {uploadingId === col.id ? "Uploading..." : col.image ? "Change Image" : "Add Image"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditingId(col.id); setEditingName(col.name); setEditingDescription(col.description ?? ""); }}
                      className={styles.btnOutline}
                    >
                      Edit
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(col)} className={styles.btnDanger}>Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this collection?"
        message={deleteTarget ? `"${deleteTarget.name}" will be removed from the homepage.` : ""}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        danger
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
