"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-client";
import { setToken, ADMIN_COOKIE, ADMIN_MAX_AGE } from "@/lib/token";
import loginStyles from "@/app/styles/dashboard styling/login.module.css";
import sharedStyles from "@/app/styles/dashboard styling/shared.module.css";

const styles = { ...loginStyles, ...sharedStyles };

export default function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const email    = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message ?? "Invalid email or password.");
        return;
      }

      setToken(ADMIN_COOKIE, data.token, ADMIN_MAX_AGE);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={styles.loginPage}>
      <form onSubmit={handleSubmit} className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Legatee Admin</h1>
        <p className={styles.loginSubtitle}>Sign in to manage the catalog.</p>

        <div className={styles.loginFields}>
          <label className={styles.field}>
            Email
            <input type="email" name="email" required autoComplete="username" className={styles.input} />
          </label>
          <label className={styles.field}>
            Password
            <input type="password" name="password" required autoComplete="current-password" className={styles.input} />
          </label>
        </div>

        {error && <p className={styles.loginError} role="alert">{error}</p>}

        <button type="submit" disabled={pending} className={`${styles.btnPrimary} ${styles.btnFullWidth}`}>
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
