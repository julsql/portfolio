import { useTranslation } from "react-i18next";

interface Props {
  onStart: () => void;
  onToggleLang: () => void;
}

export default function TitleScreen({ onStart, onToggleLang }: Props) {
  const { t } = useTranslation();
  return (
    <div className="title-screen" onClick={onStart} role="button" tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onStart()}>
      <button
        className="lang-btn title-lang"
        onClick={(e) => {
          e.stopPropagation();
          onToggleLang();
        }}
      >
        {t("hud.lang")}
      </button>

      <div className="triforce">
        <span />
        <span />
        <span />
      </div>

      <h1 className="title-main">{t("title")}</h1>
      <p className="title-sub">{t("subtitle")}</p>

      <p className="press-start blink">{t("press_start")}</p>
    </div>
  );
}
