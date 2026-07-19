// Cookie-based token storage — readable by both SSR (via next/headers cookies())
// and client-side JavaScript. No proxy routes needed.

export const ADMIN_COOKIE = "legatee_admin_token";
export const USER_COOKIE  = "legatee_user_token";
export const ADMIN_MAX_AGE = 8 * 60 * 60;          // 8 hours
export const USER_MAX_AGE  = 30 * 24 * 60 * 60;    // 30 days

/** Read a cookie value from document.cookie (client-side only). */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  for (const part of document.cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim() || null;
  }
  return null;
}

/** Set a cookie that is readable by both JS and Next.js SSR. */
export function setToken(name: string, value: string, maxAge: number) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/** Clear a cookie. */
export function clearToken(name: string) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

/** Return Authorization header object, or empty object if no token. */
export function adminAuthHeader(): Record<string, string> {
  const token = getCookie(ADMIN_COOKIE);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function userAuthHeader(): Record<string, string> {
  const token = getCookie(USER_COOKIE);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
