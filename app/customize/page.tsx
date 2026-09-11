"use client";
import { TailoringApp } from "../tailoring-app";
import { useAuthGuard } from "../lib/useAuthGuard";

export default function CustomizePage(){
  const { user, ready } = useAuthGuard(true);
  if (!ready || !user) return <main className="admin-page admin-loading">正在检查登录状态…</main>;
  return <TailoringApp whiteLabel/>;
}
