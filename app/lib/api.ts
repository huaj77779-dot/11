"use client";

/** 从 localStorage 取 token 并构造鉴权头 */
export function authHeaders(): Record<string, string> {
  if (typeof localStorage === "undefined") return {};
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function setAuth(token: string, user: { id: number; username: string; role: string; storeName: string }): void {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function currentUser(): { id: number; username: string; role: string; storeName: string } | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 统一请求：自动带 token；401 时跳转登录页 */
export async function apiFetch<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...authHeaders(), ...(init?.headers as Record<string, string> | undefined) };
  if (init?.body && typeof init.body === "string" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new Error("未登录");
  }
  const data = (await res.json()) as T;
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error ?? "请求失败");
  }
  return data;
}
