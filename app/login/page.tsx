"use client";
import { useState } from "react";
import { setAuth } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { LanguageSwitcher } from "../_components/LanguageSwitcher";

export default function LoginPage() {
  const { t } = useLocale(); const [username, setUsername] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(""); try { const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) }); const data = await res.json(); if (!res.ok) throw new Error(data.error ?? "Login failed"); setAuth(data.user); window.location.href = data.user.role === "master" ? "/admin" : "/customize"; } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); } finally { setLoading(false); } };
  return <main className="login-page"><div className="login-card"><div className="auth-language"><LanguageSwitcher /></div><div className="login-brand"><i className="login-monogram"><img src="/brand/verosuits-monogram.png" alt="" /></i><div><b>VEROSUITS</b><small>MADE-TO-MEASURE PORTAL</small></div></div><h1>{t("auth.loginTitle")}</h1><p className="login-sub">{t("auth.loginLead")}</p><form onSubmit={submit}><label><span>{t("auth.emailOrAccount")}</span><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("auth.emailOrAccount")} autoFocus required /></label><label><span>{t("auth.password")}</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.password")} required /></label>{error && <p className="login-error">{error}</p>}<button type="submit" className="login-btn" disabled={loading}>{loading ? "…" : t("auth.signIn")}</button></form><p className="login-links"><a href="/register">{t("auth.createAccount")}</a></p></div></main>;
}
