import { useState } from "react";
import { enableTournamentSharing } from "../services/tournamentService";
import { getShareFixturesUrl } from "../lib/shareLink";
import { isShareMigrationError, SHARE_FIXTURES_MIGRATION_SQL } from "../lib/shareMigration";

export default function ShareFixturesButton({ tournamentId, disabled }) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  const handleShare = async () => {
    if (!tournamentId || disabled) return;
    setSharing(true);
    setNeedsMigration(false);
    try {
      await enableTournamentSharing(tournamentId);
      const url = getShareFixturesUrl(tournamentId);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      if (isShareMigrationError(err)) {
        setNeedsMigration(true);
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="share-fixtures">
      <button
        type="button"
        className="mode-btn share-fixtures__btn"
        onClick={handleShare}
        disabled={disabled || sharing}
      >
        {copied ? "Link copied!" : sharing ? "Preparing…" : "Copy share link"}
      </button>
      {needsMigration && (
        <div className="share-fixtures__migration" role="alert">
          <p>
            Sharing needs a one-time database update. Run{" "}
            <code>supabase/share-fixtures.sql</code> in Supabase SQL Editor, then try again.
          </p>
          <button
            type="button"
            className="btn-text"
            onClick={() => navigator.clipboard.writeText(SHARE_FIXTURES_MIGRATION_SQL)}
          >
            Copy SQL
          </button>
        </div>
      )}
    </div>
  );
}
