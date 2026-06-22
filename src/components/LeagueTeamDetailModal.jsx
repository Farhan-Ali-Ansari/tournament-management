import { useRef, useState } from "react";
import { exportElementFullContent } from "../lib/exportImage";

export default function LeagueTeamDetailModal({
  teamName,
  stats,
  matches,
  tournamentName = "",
  onClose,
}) {
  const panelRef = useRef(null);
  const captureRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  if (!teamName) return null;

  const isPlayed = (m) => m.scoreA !== "" && m.scoreB !== "";

  const teamMatches = matches
    .filter((m) => m.teamA === teamName || m.teamB === teamName)
    .sort((a, b) => Number(isPlayed(b)) - Number(isPlayed(a)));

  const opponent = (m) => (m.teamA === teamName ? m.teamB : m.teamA);
  const teamScore = (m) => (m.teamA === teamName ? m.scoreA : m.scoreB);
  const oppScore = (m) => (m.teamA === teamName ? m.scoreB : m.scoreA);

  const resultLabel = (m) => {
    if (m.scoreA === "" || m.scoreB === "") return "Pending";
    const a = Number(teamScore(m));
    const b = Number(oppScore(m));
    if (a > b) return "Win";
    if (a < b) return "Loss";
    return "Draw";
  };

  const takeScreenshot = async () => {
    if (!captureRef.current || !panelRef.current) return;
    setExporting(true);
    try {
      const safeTournament = (tournamentName || "tournament")
        .trim()
        .replace(/[^\w-]+/g, "-")
        .slice(0, 32);
      const safeTeam = teamName.trim().replace(/[^\w-]+/g, "-").slice(0, 32);
      await exportElementFullContent(
        captureRef.current,
        `${safeTournament}-${safeTeam}-details.png`,
        {
          width: panelRef.current.clientWidth,
          frameElement: panelRef.current,
        }
      );
    } catch {
      // ignore — user can retry
    } finally {
      setExporting(false);
    }
  };
  return (
    <div className="team-detail-modal" role="dialog" aria-modal="true" aria-labelledby="team-detail-title">
      <button
        type="button"
        className="team-detail-modal__backdrop"
        aria-label="Close"
        onClick={onClose}
      />
      <div ref={panelRef} className="team-detail-modal__panel">
        <div ref={captureRef} className="team-detail-modal__capture">
        <header className="team-detail-modal__header">          <h2 id="team-detail-title">{teamName}</h2>
          <button type="button" className="team-detail-modal__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        {stats && (
          <div className="team-detail-modal__stats team-detail-modal__stats--compact">
            <div className="team-detail-stat">
              <span className="team-detail-stat__value">{stats.played}</span>
              <span className="team-detail-stat__label">Played</span>
            </div>
            <div className="team-detail-stat">
              <span className="team-detail-stat__value">{stats.won}</span>
              <span className="team-detail-stat__label">Won</span>
            </div>
            <div className="team-detail-stat">
              <span className="team-detail-stat__value">{stats.lost}</span>
              <span className="team-detail-stat__label">Lost</span>
            </div>
          </div>
        )}

        <section className="team-detail-modal__fixtures">
          <h3 className="section-title">Who they played</h3>
          {teamMatches.length === 0 ? (
            <p className="team-detail-modal__empty">No fixtures yet.</p>
          ) : (
            <ul className="team-detail-fixtures">
              {teamMatches.map((m) => (
                <li key={m.id} className="team-detail-fixture">
                  <span className="team-detail-fixture__opponent">vs {opponent(m)}</span>
                  <span className="team-detail-fixture__score">
                    {m.scoreA === "" || m.scoreB === ""
                      ? "—"
                      : `${teamScore(m)} – ${oppScore(m)}`}
                  </span>
                  <span
                    className={`team-detail-fixture__result team-detail-fixture__result--${resultLabel(m).toLowerCase()}`}
                  >
                    {resultLabel(m)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        </div>
        <footer className="team-detail-modal__footer">
          <button
            type="button"
            className="btn-action team-detail-modal__screenshot"
            onClick={takeScreenshot}
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Save screenshot"}
          </button>
        </footer>
      </div>
    </div>
  );
}
