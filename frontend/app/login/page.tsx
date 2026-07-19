"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "../components/UserContext";
import { API_URL } from "@/lib/api-client";
import { useLanguage } from "../components/LanguageContext";
import { getT } from "@/lib/translations";

type FpStep = "email" | "otp" | "password" | "done";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ForgotPasswordModal({ onClose }: { onClose: () => void }) {
  const { lang } = useLanguage();
  const t = getT(lang);
  const [step, setStep]       = useState<FpStep>("email");
  const [email, setEmail]     = useState("");
  const [otp, setOtp]         = useState("");
  const [newPass, setNewPass] = useState("");
  const [confPass, setConfPass] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function post(path: string, body: object) {
    const res = await fetch(`${API_URL}/api/user/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await post("forgot-password", { email });
      setStep("otp");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await post("verify-otp", { email, otp });
      setStep("password");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPass !== confPass) { setError(t.login.passwordsNoMatch); return; }
    setLoading(true);
    try {
      await post("reset-password", { email, otp, password: newPass });
      setStep("done");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full border px-4 py-3 text-sm outline-none transition text-black";
  const inputStyle = { backgroundColor: "#fff", color: "#000", borderColor: "#000" } as React.CSSProperties;
  const btnCls = "w-full py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-60 cursor-pointer";
  const btnStyle = { backgroundColor: "#173946" } as React.CSSProperties;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ height: "100dvh" }}>
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm p-8 shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-xl cursor-pointer" style={{color:"#173946"}}>&times;</button>

        {step === "email" && (
          <>
            <h2 className="font-heading text-2xl uppercase tracking-widest mb-1" style={{color:"#173946"}}>{t.login.resetPassword}</h2>
            <p className="text-xs mb-6" style={{color:"#000"}}>{t.login.resetSubtitle}</p>
            <form onSubmit={handleEmail} className="flex flex-col gap-4">
              <input type="email" required placeholder={t.login.email} value={email} onChange={e => setEmail(e.target.value)} className={inputCls} style={inputStyle} />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className={btnCls} style={btnStyle}>
                {loading ? t.login.sending : t.login.sendCode}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h2 className="font-heading text-2xl uppercase tracking-widest mb-1" style={{color:"#173946"}}>{t.login.enterCode}</h2>
            <p className="text-xs mb-6" style={{color:"#000"}}>{t.login.codeSubtitle} <strong>{email}</strong>. {t.login.codeExpiry}</p>
            <form onSubmit={handleOtp} className="flex flex-col gap-4">
              <input type="text" required maxLength={5} placeholder={t.login.codeInput} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))} className={`${inputCls} tracking-widest text-center text-lg`} style={inputStyle} />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className={btnCls} style={btnStyle}>
                {loading ? t.login.verifying : t.login.verifyCode}
              </button>
              <button type="button" onClick={() => setStep("email")} className="text-xs text-center cursor-pointer" style={{color:"#000"}}>{t.login.back}</button>
            </form>
          </>
        )}

        {step === "password" && (
          <>
            <h2 className="font-heading text-2xl uppercase tracking-widest mb-1" style={{color:"#173946"}}>{t.login.newPassword}</h2>
            <p className="text-xs mb-6" style={{color:"#000"}}>{t.login.newPasswordSubtitle}</p>
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div className="relative">
                <input type={showNew ? "text" : "password"} required minLength={6} placeholder={t.login.newPasswordInput} value={newPass} onChange={e => setNewPass(e.target.value)} className={`${inputCls} pr-10`} style={inputStyle} />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{color:"#000"}}>
                  <EyeIcon open={showNew} />
                </button>
              </div>
              <div className="relative">
                <input type={showConf ? "text" : "password"} required minLength={6} placeholder={t.login.confirmPasswordInput} value={confPass} onChange={e => setConfPass(e.target.value)} className={`${inputCls} pr-10`} style={inputStyle} />
                <button type="button" onClick={() => setShowConf(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{color:"#000"}}>
                  <EyeIcon open={showConf} />
                </button>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button type="submit" disabled={loading} className={btnCls} style={btnStyle}>
                {loading ? t.login.saving : t.login.savePassword}
              </button>
            </form>
          </>
        )}

        {step === "done" && (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl">✓</div>
            <h2 className="font-heading text-2xl uppercase tracking-widest" style={{color:"#173946"}}>{t.login.passwordUpdated}</h2>
            <p className="text-xs" style={{color:"#000"}}>{t.login.passwordUpdatedMsg}</p>
            <button onClick={onClose} className={btnCls} style={btnStyle}>
              {t.login.backToLogin}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useUser();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [fpOpen, setFpOpen]     = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed.");
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
  const inputStyle = { backgroundColor: "#fff", color: "#000", borderColor: "#000" } as React.CSSProperties;
  const inputCls = "w-full border rounded-lg px-4 py-3 text-sm outline-none transition-all duration-200 text-black placeholder-gray-600";

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-b from-cream/30 to-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{backgroundColor:"rgba(23,57,70,0.1)"}}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color:"#173946"}}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl uppercase tracking-widest" style={{color:"#173946"}}>{t.login.welcomeBack}</h1>
            <p className="text-sm mt-2" style={{color:"#000"}}>{t.login.subtitle}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-line/50 p-6 md:p-8">
            <p className="text-center text-sm mb-6" style={{color:"#000"}}>
              {t.login.newHere}{" "}
              <Link href="/signup" className="font-medium hover:underline transition" style={{color:"#173946"}}>{t.login.createAccount}</Link>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{color:"#000"}}>
                  {t.login.email} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder={t.login.emailPlaceholder}
                  className={inputCls}
                  style={inputStyle}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{color:"#000"}}>
                    {t.login.password} <span className="text-red-500">*</span>
                  </label>
                  <button type="button" onClick={() => setFpOpen(true)} className="text-xs hover:underline transition cursor-pointer" style={{color:"#173946"}}>
                    {t.login.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={t.login.passwordPlaceholder}
                    className={`${inputCls} pr-10`}
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{color:"#000"}}>
                    <EyeIcon open={showPass} />
                  </button>
                </div>
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
                type="submit" disabled={loading}
                className="w-full text-white py-3.5 px-6 rounded-lg text-sm font-semibold tracking-widest uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                style={{backgroundColor:"#173946"}}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.login.signingIn}
                  </span>
                ) : t.login.signIn}
              </button>
            </form>
          </div>
        </div>
      {fpOpen && <ForgotPasswordModal onClose={() => setFpOpen(false)} />}
    </main>
  );
}
