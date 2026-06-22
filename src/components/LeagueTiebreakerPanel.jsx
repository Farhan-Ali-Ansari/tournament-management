import { useState } from "react";
import LeagueMatches from "./LeagueMatches";
import LeagueTable from "./LeagueTable";

export default function LeagueTiebreakerPanel({
  tiedTeams,
  tiebreakerMatches,
  tiebreakerTable,
  playoffStarted,
  needsNextRound,
  completed = false,
  onStart,
  onScoreChange,
  onViewDetails,
  onReset,
  readOnly = false,
}) {
  const [subTab, setSubTab] = useState("fixtures");

  if (!tiedTeams?.length && !tiebreakerMatches?.length) return null;

  const hasHistory = tiebreakerMatches.length > 0;
  const showStart = !completed && !readOnly && (!playoffStarted || needsNextRound);
  const startLabel = !playoffStarted
    ? "Start tiebreaker league"
    : "Start next tiebreaker round";

  return (
    <div className="tiebreaker-panel">
      {completed ? (
        <p className="tiebreaker-panel__intro" data-export-hide>
          Tiebreaker results are kept permanently, separate from the main season. You can
          still edit scores here if you need to correct them.
          {tiedTeams?.length > 0 && (
            <>
              {" "}
              Teams involved: <strong>{tiedTeams.join(", ")}</strong>.
            </>
          )}
        </p>
      ) : (
        <p className="tiebreaker-panel__intro" data-export-hide>
          The league season ended in a tie between{" "}
          <strong>{tiedTeams?.join(", ")}</strong>. Play a separate mini-league between
          the tied teams — fixtures and standings are kept apart from the main season.
        </p>
      )}

      {showStart && (
        <button type="button" className="btn-action tiebreaker-panel__start" onClick={onStart} data-export-hide>
          {startLabel}
        </button>
      )}

      {(playoffStarted || hasHistory) && (
        <>
          <div className="league-tabs tiebreaker-panel__tabs" data-export-hide>
            <button
              type="button"
              className={`league-tab ${subTab === "fixtures" ? "league-tab--active" : ""}`}
              onClick={() => setSubTab("fixtures")}
            >
              Fixtures
            </button>
            <button
              type="button"
              className={`league-tab ${subTab === "standings" ? "league-tab--active" : ""}`}
              onClick={() => setSubTab("standings")}
            >
              Standings
            </button>
          </div>

          {subTab === "fixtures" && (
            <div className="tiebreaker-panel__section">
              <h4 className="tiebreaker-panel__section-title">Tiebreaker fixtures</h4>
              <LeagueMatches
                matches={tiebreakerMatches}
                onScoreChange={onScoreChange}
                readOnly={readOnly}
                searchInputId="tiebreaker-fixture-search"
              />
            </div>
          )}

          {subTab === "standings" && (
            <div className="tiebreaker-panel__section">
              <h4 className="tiebreaker-panel__section-title">Tiebreaker standings</h4>
              <LeagueTable table={tiebreakerTable} onViewDetails={onViewDetails} />
            </div>
          )}

          {needsNextRound && !readOnly && (
            <p className="tiebreaker-panel__note" data-export-hide>
              All current tiebreaker fixtures are scored but teams are still tied. Start
              another round to break the tie.
            </p>
          )}

          {!readOnly && (
            <button
              type="button"
              className="btn-reset mode-btn tiebreaker-panel__reset"
              onClick={onReset}
              data-export-hide
            >
              Reset tiebreaker
            </button>
          )}
        </>
      )}

      {!playoffStarted && !hasHistory && readOnly && (
        <p className="tiebreaker-panel__intro" data-export-hide>The tiebreaker league has not started yet.</p>
      )}
    </div>
  );
}
