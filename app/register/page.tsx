"use client";

import { useState } from "react";

const whatsappHref = "https://wa.me/18169255770?text=Hello%20Vero%20Suits%2C%20I%20would%20like%20to%20register%20a%20store%20account.";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, message: `【门店账号注册】${form.message}` }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "提交失败，请稍后重试。");
      setStatus("done");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "提交失败，请稍后重试。");
      setStatus("error");
    }
  };

  return (
    <main className="login-page register-page">
      <section className="login-card register-card">
        <a className="auth-back" href="/login">← 返回登录</a>
        <div className="login-brand">
          <i className="login-monogram"><img src="/brand/verosuits-monogram.png" alt="" /></i>
          <div><b>VEROSUITS</b><small>STORE ACCOUNT REQUEST</small></div>
        </div>
        <p className="auth-eyebrow">NEW PARTNER</p>
        <h1>注册门店账号</h1>
        <p className="login-sub">提交基本信息后，我们会为您核对合作资料并开通下单权限。</p>
        {status === "done" ? (
          <div className="register-success" role="status">
            <b>申请已收到</b>
            <p>我们会尽快联系您确认账户信息。若希望更快沟通，可直接 WhatsApp 联系我们。</p>
            <a className="login-btn" href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp 联系注册</a>
            <a className="auth-text-link" href="/login">返回登录页</a>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label><span>公司 / 门店名称</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="例如：Vero Tailoring London" autoFocus required /></label>
            <label><span>邮箱或 WhatsApp</span><input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} placeholder="name@store.com / +1 …" required /></label>
            <label><span>所在地与合作需求 <em>可选</em></span><textarea rows={3} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="国家/城市、预计订单类型或想了解的合作方式" /></label>
            {status === "error" && <p className="login-error" role="alert">{error}</p>}
            <button type="submit" className="login-btn" disabled={status === "sending"}>{status === "sending" ? "提交中…" : "提交注册申请"}</button>
          </form>
        )}
        {status !== "done" && <p className="register-alternative">已有账号？<a href="/login">立即登录</a>　或 <a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp 联系我们</a></p>}
      </section>
    </main>
  );
}
