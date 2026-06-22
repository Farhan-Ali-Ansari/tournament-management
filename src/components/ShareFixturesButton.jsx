import { useState } from "react";
import {
  disableTournamentSharing,
  enableTournamentSharing,
} from "../services/tournamentService";
import { getShareFixturesUrl } from "../lib/shareLink";
import { copyToClipboard } from "../lib/clipboard";
import { isShareMigrationError, SHARE_FIXTURES_MIGRATION_SQL } from "../lib/shareMigration";
import { getAuthErrorMessage } from "../lib/authErrors";

export default function ShareFixturesButton({
  tournamentId,
  disabled,
  shareEnabled,
  onShareEnabledChange,
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [error, setError] = useState("");

  const shareUrl = tournamentId ? getShareFixturesUrl(tournamentId) : "";

  const handleCopy = async () => {
    if (!shareUrl) return;
    const ok = await copyToClipboard(shareUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      setError("Could not copy link. Copy it manually from the address bar after opening share.");
    }
  };

  const handleEnable = async () => {
    if (!tournamentId || disabled) return;
    setBusy(true);
    setError("");
    setNeedsMigration(false);
    try {
      await enableTournamentSharing(tournamentId);
      onShareEnabledChange?.(true);
      await handleCopy();
    } catch (err) {
      if (isShareMigrationError(err)) {
        setNeedsMigration(true);
      } else {
        setError(getAuthErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!tournamentId) return;
    if (!window.confirm("Stop sharing? The link will no longer work.")) return;
    setBusy(true);
    setError("");
    try {
      await disableTournamentSharing(tournamentId);
      onShareEnabledChange?.(false);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="share-fixtures">
      {shareEnabled ? (
        <div className="share-fixtures__actions">
          <button
            type="button"
            className="mode-btn share-fixtures__btn"
            onClick={handleCopy}
            disabled={disabled || busy}
          >
            {copied ? "Link copied!" : "Copy share link"}
          </button>
          <button
            type="button"
            className="btn-reset mode-btn share-fixtures__btn share-fixtures__btn--secondary"
            onClick={handleDisable}
            disabled={busy}
          >
            Stop sharing
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="mode-btn share-fixtures__btn"
          onClick={handleEnable}
          disabled={disabled || busy}
        >
          {busy ? "Preparing…" : copied ? "Link copied!" : "Copy share link"}
        </button>
      )}
      {error && (
        <p className="share-fixtures__error" role="alert">
          {error}
        </p>
      )}
      {needsMigration && (
        <div className="share-fixtures__migration" role="alert">
          <p>
            Sharing needs a one-time database update. Run{" "}
            <code>supabase/share-fixtures.sql</code> in Supabase SQL Editor, then try again.
          </p>
          <button
            type="button"
            className="btn-text"
            onClick={() => copyToClipboard(SHARE_FIXTURES_MIGRATION_SQL)}
          >
            Copy SQL
          </button>
        </div>
      )}
    </div>
  );
}
