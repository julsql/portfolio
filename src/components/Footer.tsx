import { useTranslation } from "react-i18next";

const GITHUB_URL = "https://github.com/julsql";
const ZS_URL = "https://noproblo.dayjo.org/zeldasounds/";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="site-footer">
      <span className="footer-tri" aria-hidden="true" />
      <span className="footer-made">{t("footer.made")}</span>
      <a className="footer-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
        ⌥ {t("footer.github")}
      </a>
      <span className="footer-tech">{t("footer.tech")}</span>
      <span className="footer-credits">
        {t("footer.sounds_prefix")}{" "}
        <a
          className="footer-credits-link"
          href={ZS_URL}
          target="_blank"
          rel="noreferrer"
          title={ZS_URL}
        >
          {t("footer.sounds_supplier")}
        </a>{" "}
        — {t("footer.sounds_from")}
      </span>
    </footer>
  );
}
