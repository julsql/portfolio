import { useTranslation } from "react-i18next";
import type { Category } from "../types";

const ITEMS: { cat: Category; icon: string }[] = [
  { cat: "web", icon: "🏰" },
  { cat: "app", icon: "🗿" },
  { cat: "tool", icon: "🪙" },
];

export default function Legend() {
  const { t } = useTranslation();
  return (
    <aside className="legend" aria-label={t("legend.title")}>
      <h2 className="legend-title">{t("legend.title")}</h2>
      <ul>
        {ITEMS.map(({ cat, icon }) => (
          <li key={cat} className={`legend-item cat-${cat}`}>
            <span className="legend-dot">{icon}</span>
            {t(`legend.${cat}`)}
          </li>
        ))}
      </ul>
    </aside>
  );
}
