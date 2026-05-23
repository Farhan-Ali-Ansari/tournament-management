import { useState } from "react";
import { CUSTOM_MODES_MIGRATION_SQL } from "../lib/requiredDbMigration";

export default function DatabaseSetupAlert({ onDismiss }) {
  const [copied, setCopied] = useState(false);

  const copySql = async () => {
    try {
      await navigator.clipboard.writeText(CUSTOM_MODES_MIGRATION_SQL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="db-setup-alert" role="alert">
      <h3 className="db-setup-alert__title">Database update required</h3>
      <p>
        Custom League and Custom Knockout cannot save until you run this SQL once in
        your Supabase project (<strong>SQL Editor → New query → Run</strong>).
      </p>
      <ol className="db-setup-alert__steps">
        <li>Open your project at supabase.com</li>
        <li>Go to SQL Editor → New query</li>
        <li>Paste the SQL below (or use Copy SQL) and click Run</li>
        <li>Reload this app and try again</li>
      </ol>
      <pre className="db-setup-alert__sql">{CUSTOM_MODES_MIGRATION_SQL}</pre>
      <div className="db-setup-alert__actions">
        <button type="button" className="btn-action" onClick={copySql}>
          {copied ? "Copied!" : "Copy SQL"}
        </button>
        {onDismiss && (
          <button type="button" className="btn-text" onClick={onDismiss}>
            Dismiss
          </button>
        )}
      </div>
      <p className="db-setup-alert__file-hint">
        Or open <code>supabase/FIX-CUSTOM-MODES.sql</code> in this repo.
      </p>
    </div>
  );
}
