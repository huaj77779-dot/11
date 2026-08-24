"use client";

import { useEffect, useState } from "react";
import { authHeaders, currentUser } from "./api";

export type GuardUser = { id: number; username: string; role: string; storeName: string } | null;

/**
 * 页面守卫：挂载时校验登录态。
 * redirect=true（默认）：未登录跳转 /login（管理/操作页）。
 * redirect=false：未登录保持游客可浏览（展示页）。
 */
export function useAuthGuard(redirect = true): { user: GuardUser; ready: boolean } {
  const [user, setUser] = useState<GuardUser>(() => currentUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { headers: authHeaders() });
        if (res.status === 401) {
          if (!cancelled) {
            setUser(null);
            if (redirect && typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
              window.location.href = "/login";
            }
          }
          return;
        }
        const data = (await res.json()) as { user: GuardUser };
        if (!cancelled) {
          setUser(data.user);
          if (typeof localStorage !== "undefined" && data.user) {
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [redirect]);

  return { user, ready };
}
