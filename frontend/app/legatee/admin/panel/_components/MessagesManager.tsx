"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api-client";
import type { ContactMessage } from "@/lib/api";
import styles from "@/app/styles/dashboard styling/messages.module.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesManager({ initialMessages }: { initialMessages: ContactMessage[] }) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  async function markRead(msg: ContactMessage) {
    if (msg.read) return;
    try {
      await fetch(`${API_URL}/api/contactpage/messages/${msg.id}/read`, {
        method: "PATCH",
        credentials: "include",
        headers: { Authorization: `Bearer ${document.cookie.match(/adminToken=([^;]+)/)?.[1] ?? ""}` },
      });
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
      setSelected((prev) => (prev?.id === msg.id ? { ...prev, read: true } : prev));
    } catch {
      // silent — UI already shows the message
    }
  }

  function openMessage(msg: ContactMessage) {
    setSelected(msg);
    markRead(msg);
  }

  return (
    <div className={styles.page}>
      {/* Filter tabs */}
      <div className={styles.tabs}>
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`${styles.tab} ${filter === f ? styles.tabActive : ""}`}
          >
            {f === "all" ? "All" : f === "unread" ? "Unread" : "Read"}
            {f === "unread" && unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* Message list */}
        <ul className={styles.list}>
          {filtered.length === 0 && (
            <li className={styles.empty}>No messages.</li>
          )}
          {filtered.map((msg) => (
            <li
              key={msg.id}
              onClick={() => openMessage(msg)}
              className={`${styles.item} ${selected?.id === msg.id ? styles.itemSelected : ""} ${!msg.read ? styles.itemUnread : ""}`}
            >
              <div className={styles.itemHeader}>
                <span className={styles.itemName}>{msg.name}</span>
                <span className={styles.itemDate}>{formatDate(msg.createdAt)}</span>
              </div>
              <span className={styles.itemEmail}>{msg.email}</span>
              <p className={styles.itemPreview}>{msg.message}</p>
            </li>
          ))}
        </ul>

        {/* Detail panel */}
        <div className={styles.detail}>
          {!selected ? (
            <p className={styles.detailEmpty}>Select a message to read it.</p>
          ) : (
            <>
              <div className={styles.detailHeader}>
                <h2 className={styles.detailName}>{selected.name}</h2>
                <span className={styles.detailDate}>{formatDate(selected.createdAt)}</span>
              </div>
              <div className={styles.detailMeta}>
                <a href={`mailto:${selected.email}`} className={styles.detailEmail}>{selected.email}</a>
                {selected.phone && <span className={styles.detailPhone}>{selected.phone}</span>}
              </div>
              <div className={styles.detailBody}>
                <p>{selected.message}</p>
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: Your enquiry`}
                className={styles.replyBtn}
              >
                Reply via Email
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
