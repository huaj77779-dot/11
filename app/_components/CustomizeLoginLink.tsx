"use client";

import { type ReactNode } from "react";

export function CustomizeLoginLink({ className, children }: { className?: string; children: ReactNode }) {
  return <a className={className} href="/login">{children}</a>;
}
