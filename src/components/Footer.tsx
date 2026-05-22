import { useTranslation } from "react-i18next";

const GITHUB_URL = "https://github.com/julsql";

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
    </footer>
  );
}
