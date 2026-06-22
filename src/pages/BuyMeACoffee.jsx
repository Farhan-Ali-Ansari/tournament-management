import { useState } from "react";
import { Link } from "react-router-dom";
import { copyToClipboard } from "../lib/clipboard";
import DashboardLayout from "../components/DashboardLayout";

const JAZZCASH_NUMBER = "03213753740";

const steps = [
  {
    num: "01",
    title: "Open JazzCash",
    detail: "Launch the JazzCash app on your phone and sign in to your account.",
  },
  {
    num: "02",
    title: "Send money",
    detail: "Choose Send Money or Mobile Account, depending on your app version.",
  },
  {
    num: "03",
    title: "Enter the number",
    detail: `Paste or type ${JAZZCASH_NUMBER} as the recipient.`,
  },
  {
    num: "04",
    title: "Complete with warmth",
    detail: "Add any amount you wish, confirm, and you are done. Every gesture is cherished.",
  },
];

export default function BuyMeACoffee() {
  const [copied, setCopied] = useState(false);

  const copyNumber = async () => {
    const ok = await copyToClipboard(JAZZCASH_NUMBER);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <DashboardLayout>
      <article className="coffee-page" aria-labelledby="coffee-page-title">
        <div className="coffee-page__ambient" aria-hidden="true">
          <span className="coffee-page__glow coffee-page__glow--a" />
          <span className="coffee-page__glow coffee-page__glow--b" />
          <span className="coffee-page__grain" />
        </div>

        <header className="coffee-page__hero">
          <div className="coffee-page__crest" aria-hidden="true">
            <span className="coffee-page__crest-line" />
            <span className="coffee-page__crest-mark">☕</span>
            <span className="coffee-page__crest-line" />
          </div>
          <p className="coffee-page__eyebrow">An invitation, graciously extended</p>
          <h1 id="coffee-page-title" className="coffee-page__title">
            Buy me a coffee
          </h1>
          <p className="coffee-page__lead">
            Jackaroo Tournament Manager is crafted for organizers who care about the
            beautiful details. If the app has made your leagues and cups run smoother, a
            small JazzCash gift keeps the work alive.
          </p>
        </header>

        <section className="coffee-page__vault" aria-labelledby="coffee-vault-title">
          <h2 id="coffee-vault-title" className="visually-hidden">
            JazzCash payment details
          </h2>
          <div className="coffee-vault">
            <div className="coffee-vault__frame" aria-hidden="true" />
            <p className="coffee-vault__label">JazzCash account</p>
            <a
              href={`tel:${JAZZCASH_NUMBER}`}
              className="coffee-vault__number"
            >
              {JAZZCASH_NUMBER}
            </a>
            <p className="coffee-vault__hint">Tap the number to call · or copy below</p>
            <button
              type="button"
              className={`coffee-vault__copy ${copied ? "coffee-vault__copy--done" : ""}`}
              onClick={copyNumber}
            >
              {copied ? "Copied to clipboard" : "Copy account number"}
            </button>
          </div>
        </section>

        <section className="coffee-page__steps" aria-labelledby="coffee-steps-title">
          <h2 id="coffee-steps-title" className="coffee-page__section-title">
            How to send
          </h2>
          <ol className="coffee-steps">
            {steps.map((step) => (
              <li key={step.num} className="coffee-steps__item">
                <span className="coffee-steps__num">{step.num}</span>
                <div className="coffee-steps__content">
                  <h3 className="coffee-steps__title">{step.title}</h3>
                  <p className="coffee-steps__detail">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <footer className="coffee-page__footer">
          <p className="coffee-page__thanks">
            From the heart — thank you for supporting independent software and the
            tournaments you bring to life.
          </p>
          <Link to="/guide" className="coffee-page__back">
            ← Return to the concierge guide
          </Link>
        </footer>
      </article>
    </DashboardLayout>
  );
}
