"use client";

import { useLocale } from "../lib/i18n";

export function Shell({ active }: { active: "new" | "customers" | "orders" }) {
  const { t } = useLocale();
  return (
    <aside className="side">
      <div className="brand">
        <i>A</i>
        <div>
          <b>ATELIER OS</b>
          <small>WHITE-LABEL PORTAL</small>
        </div>
      </div>
      <nav>
        <a href="/customize" className={active === "new" ? "on" : ""}>
          ▦　{t("home.newOrder")}
        </a>
        <a href="/customers" className={active === "customers" ? "on" : ""}>
          ♙　{t("home.customers")}
        </a>
        <a href="/orders" className={active === "orders" ? "on" : ""}>
          ▤　{t("home.orders")}
        </a>
      </nav>
      <div className="store">
        <i />
        <div>
          <b>Baker Street Tailors</b>
          <small>{t("home.storeLocation")}</small>
        </div>
      </div>
    </aside>
  );
}
