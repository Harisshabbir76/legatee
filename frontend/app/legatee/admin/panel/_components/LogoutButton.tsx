"use client";

import { API_URL } from "@/lib/api-client";
import { getCookie, clearToken, ADMIN_COOKIE } from "@/lib/token";
import styles from "@/app/styles/dashboard styling/shared.module.css";

export default function LogoutButton() {
  async function handleLogout() {
    const token = getCookie(ADMIN_COOKIE);
    // Notify backend (best-effort — don't block on failure)
    fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include", // sends the old httpOnly cookie too
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});
    // Clear the JS-readable cookie
    clearToken(ADMIN_COOKIE);
    // Hard navigation so SSR re-evaluates auth (router.push keeps stale cache)
    window.location.href = "/legatee/admin/panel";
  }

  return (
    <button type="button" onClick={handleLogout} className={styles.btnOutline}>
      Log out
    </button>
  );
}
