"use client";

import { useLocale } from "../lib/i18n";
import { BrandLogo } from "./BrandLogo";

export function Shell({ active }: { active: "new" | "accessories" | "selection" | "customers" | "orders" }) {
  const { t } = useLocale();
  return (
    <aside className="side">
      <div className="brand"><BrandLogo compact /></div>
      <nav>
        <a href="/customize" className={active === "new" ? "on" : ""}>
          ▦ {t("home.newOrder")}
        </a>
        <a href="/accessories" className={active === "accessories" ? "on" : ""}>
          ◇ {t("home.accessories")}
        </a>
        <a href="/selection" className={active === "selection" ? "on" : ""}>
          ▣ {t("home.selection")}
        </a>
        <a href="/customers" className={active === "customers" ? "on" : ""}>
          ♙ {t("home.customers")}
        </a>
        <a href="/orders" className={active === "orders" ? "on" : ""}>
          ▤ {t("home.orders")}
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
