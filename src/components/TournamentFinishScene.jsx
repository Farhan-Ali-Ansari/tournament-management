import { useRef, useState } from "react";
import { exportCelebrationCard } from "../lib/exportImage";
import CloseIconButton from "./ui/CloseIconButton";
import ShareFixturesButton from "./ShareFixturesButton";

export default function TournamentFinishScene({
  tournamentName,
  modeLabel,
  teamCount,
  winners,
  subtitle,
  tournamentId,
  shareEnabled,
  onShareEnabledChange,
  onClose,
}) {
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const label = winners.length > 1 ? "Champions" : "Champion";
  const winnerText = winners.join(" · ");

  const handleScreenshot = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const safeName = (tournamentName || "tournament")
        .trim()
        .replace(/[^\w-]+/g, "-")
        .slice(0, 48);
      await exportCelebrationCard(exportRef.current, `${safeName}-champion.png`);
    } catch {
      // Export errors are non-blocking in the celebration view.
    } finally {
      setExporting(false);
    }
  };

  const exportCard = (
    <>
      <p className="finish-scene__export-eyebrow">Tournament complete</p>
      <h2 className="finish-scene__export-title">{tournamentName || "Tournament"}</h2>
      {teamCount > 0 && (
        <p className="finish-scene__export-meta">
          {teamCount} team{teamCount === 1 ? "" : "s"}
        </p>
      )}
      <p className="finish-scene__export-mode">{modeLabel}</p>
      <div className="finish-scene__export-winner">
        <span className="finish-scene__export-winner-label">{label}</span>
        <p className="finish-scene__export-winner-name">{winnerText}</p>
        {subtitle && <p className="finish-scene__export-subtitle">{subtitle}</p>}
      </div>
      <p className="finish-scene__export-footer">Jackaroo Tournament Manager</p>
    </>
  );

  return (
    <div className="finish-scene" role="dialog" aria-modal="true" aria-labelledby="finish-scene-title">
      <button
        type="button"
        className="finish-scene__backdrop"
        aria-label="Close"
        onClick={onClose}
      />

      {/* Fixed-size artboard for PNG export (off-screen, no action buttons). */}
      <div className="finish-scene__export-portal" aria-hidden="true">
        <div ref={exportRef} className="finish-scene__export-card">
          {exportCard}
        </div>
      </div>

      <div className="finish-scene__card">
        <CloseIconButton
          className="finish-scene__close"
          onClick={onClose}
          label="Close celebration"
          data-export-hide
        />

        <div className="finish-scene__body">
          <p className="finish-scene__eyebrow">Tournament complete</p>
          <h2 id="finish-scene-title" className="finish-scene__title">
            {tournamentName || "Tournament"}
          </h2>
          {teamCount > 0 && (
            <p className="finish-scene__meta">
              {teamCount} team{teamCount === 1 ? "" : "s"}
            </p>
          )}
          <p className="finish-scene__mode">{modeLabel}</p>

          <div className="finish-scene__winner-block">
            <span className="finish-scene__winner-label">{label}</span>
            <p className="finish-scene__winner-name">{winnerText}</p>
            {subtitle && <p className="finish-scene__subtitle">{subtitle}</p>}
          </div>

          <div className="finish-scene__actions">
            <button
              type="button"
              className="btn-action finish-scene__btn"
              onClick={handleScreenshot}
              disabled={exporting}
            >
              {exporting ? "Exporting…" : "Save screenshot"}
            </button>
            <ShareFixturesButton
              tournamentId={tournamentId}
              disabled={false}
              shareEnabled={shareEnabled}
              onShareEnabledChange={onShareEnabledChange}
            />
            <button type="button" className="mode-btn finish-scene__btn" onClick={onClose}>
              View results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
