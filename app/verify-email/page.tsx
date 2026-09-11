"use client";
import { useEffect, useState } from "react";
export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying your email…");
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setMessage("This verification link is invalid."); return; }
    void fetch("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setMessage(data.message); }).catch((error) => setMessage(error instanceof Error ? error.message : "Unable to verify this email."));
  }, []);
  return <main className="login-page"><div className="login-card"><div className="login-brand"><i className="login-monogram"><img src="/brand/verosuits-monogram.png" alt="" /></i><div><b>VEROSUITS</b><small>ACCOUNT VERIFICATION</small></div></div><h1>Email verification</h1><p className="login-sub">{message}</p><a className="login-btn login-link-button" href="/login">Go to sign in</a></div></main>;
}
