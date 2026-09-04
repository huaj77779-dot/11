"use client";
import { useState } from "react";
import { clearAuth } from "../lib/api";
import { useAuthGuard } from "../lib/useAuthGuard";
import { AdminConsole } from "./AdminConsole";
export default function AdminPage() {
  const { user, ready } = useAuthGuard(); const [busy, setBusy] = useState(false);
  if (!ready) return <main className="admin-page admin-loading">正在加载管理后台…</main>;
  if (!user) return <main className="admin-page admin-loading">正在跳转登录…</main>;
  if (!["master", "admin", "editor"].includes(user.role)) return <main className="admin-page admin-loading">当前账号没有后台权限。</main>;
  const logout = async () => { setBusy(true); await fetch("/api/auth/logout", { method: "POST" }); clearAuth(); window.location.assign("/login"); };
  return <AdminConsole user={user} onLogout={logout} loggingOut={busy} />;
}
