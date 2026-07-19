"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../components/UserContext";
import { API_URL } from "@/lib/api-client";
import { useLanguage } from "../components/LanguageContext";
import { getT } from "@/lib/translations";

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed.");
      const { setToken, USER_COOKIE, USER_MAX_AGE } = await import("@/lib/token");
      setToken(USER_COOKIE, data.token, USER_MAX_AGE);
      await refresh();
      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const { lang } = useLanguage();
  const t = getT(lang);
  const inputCls = "w-full border rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200 text-black placeholder-gray-600";
  const inputStyle = { backgroundColor: "#fff", color: "#000", borderColor: "#000" } as React.CSSProperties;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-cream/30 to-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{backgroundColor:"rgba(23,57,70,0.1)"}}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color:"#173946"}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl uppercase tracking-widest" style={{color:"#173946"}}>
              {t.signup.title}
            </h1>
            <p className="text-sm mt-2" style={{color:"#000"}}>{t.signup.subtitle}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-line/50 p-6 md:p-8">
            <p className="text-center text-sm mb-6" style={{color:"#000"}}>
              {t.signup.alreadyHave}{" "}
              <Link href="/login" className="font-medium hover:underline transition" style={{color:"#173946"}}>
                {t.signup.signIn}
              </Link>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{color:"#000"}}>
                  {t.signup.fullName}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.signup.fullName}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{color:"#000"}}>
                  {t.signup.email}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.signup.emailPlaceholder}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{color:"#000"}}>
                  {t.signup.password}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.signup.passwordHint}
                  className={inputCls}
                  style={inputStyle}
                />
                <p className="text-xs mt-1" style={{color:"#000"}}>{t.signup.passwordNote}</p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white py-3.5 px-6 rounded-lg text-sm font-semibold tracking-widest uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                style={{backgroundColor:"#173946"}}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.signup.creating}
                  </span>
                ) : (
                  t.signup.createAccount
                )}
              </button>
            </form>

          </div>
        </div>
    </main>
  );
}