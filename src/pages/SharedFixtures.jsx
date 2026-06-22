import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LeagueMatches from "../components/LeagueMatches";
import LeagueTable from "../components/LeagueTable";
import KnockoutBracket from "../components/KnockoutBracket";
import LeagueTeamDetailModal from "../components/LeagueTeamDetailModal";
import LeagueTiebreakerPanel from "../components/LeagueTiebreakerPanel";
import { fetchSharedTournament } from "../services/tournamentService";
import { decodeFromDatabase } from "../lib/tournamentPersistence";
import { calculateLeagueTable } from "../lib/leagueTable";
import {
  getModeLabel,
  isKnockoutMode,
  isLeagueMode,
  MODES,
} from "../lib/tournamentModes";
import { getChampion } from "../lib/knockoutBracket";
import { getTournamentFinishInfo } from "../lib/tournamentCompletion";
import PageLoading from "../components/ui/PageLoading";
import {
  calculateTiebreakerTableFromMatches,
  getTiebreakerParticipantNames,
  hasTiebreakerHistory,
  splitMatches,
} from "../lib/leagueTiebreaker";

export default function SharedFixtures() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leagueTab, setLeagueTab] = useState("fixtures");
  const [detailTeam, setDetailTeam] = useState(null);
  const [tiebreakerDetailTeam, setTiebreakerDetailTeam] = useState(null);
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const row = await fetchSharedTournament(id);
      if (!row?.share_enabled) {
        setError("This share link is not active. Ask the organizer to copy a new link.");
        setData(null);
        return;
      }
      const decoded = decodeFromDatabase(row);
      const { regularMatches, tiebreakerMatches } = splitMatches(decoded.matches);
      const hasFixtures =
        regularMatches.length > 0 ||
        tiebreakerMatches.length > 0 ||
        decoded.knockout_rounds.length > 0;
      if (!hasFixtures) {
        setError("No fixtures have been published yet.");
        setData(null);
        return;
      }
      setData(decoded);
      setLastUpdated(new Date());
      setError("");
    } catch {
      if (!silent) {
        setError("Could not load fixtures. The link may be invalid or sharing may be disabled.");
        setData(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load({ silent: true }), 30000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return <PageLoading message="Loading fixtures…" />;
  }

  if (error || !data) {
    return (
      <div className="shared-fixtures shared-fixtures--error">
        <div className="shared-fixtures__card">
          <h1 className="shared-fixtures__title">Fixtures unavailable</h1>
          <p className="shared-fixtures__message">{error}</p>
          <button type="button" className="btn-action" onClick={load}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { name, mode, teams, matches, knockout_rounds: knockoutRounds } = data;
  const { regularMatches, tiebreakerMatches } = splitMatches(matches);
  const modeLabel = getModeLabel(mode);
  const exportEyebrow =
    mode === MODES.CUSTOM_LEAGUE
      ? "Custom League"
      : mode === MODES.CUSTOM_KNOCKOUT
        ? "Custom Knockout"
        : isKnockoutMode(mode)
          ? "Knockout"
          : "League";
  const tableData = calculateLeagueTable(teams, regularMatches);
  const champion = getChampion(knockoutRounds);
  const finishInfo = getTournamentFinishInfo({
    mode,
    matches,
    knockoutRounds,
    table: tableData,
  });
  const tiebreakerTeams =
    finishInfo.tiedTeams?.length > 0
      ? finishInfo.tiedTeams
      : getTiebreakerParticipantNames(tiebreakerMatches);
  const showTiebreakerTab =
    hasTiebreakerHistory(tiebreakerMatches) || finishInfo.needsTiebreaker;
  const tiebreakerTableData = tiebreakerMatches.length
    ? finishInfo.tiebreakerTable ||
      calculateTiebreakerTableFromMatches(tiebreakerMatches)
    : {};

  return (
    <div className="shared-fixtures">
      {finishInfo.needsTiebreaker && (
        <div className="finish-banner finish-banner--tie finish-banner--static" role="status">
          <span className="finish-banner__label">Tiebreaker league</span>
          <span className="finish-banner__winner">{finishInfo.tiedTeams?.join(" · ")}</span>
        </div>
      )}
      {finishInfo.finished && (
        <div className="finish-banner finish-banner--static" role="status">
          <span className="finish-banner__label">Tournament complete</span>
          <span className="finish-banner__winner">{finishInfo.winners.join(" · ")}</span>
        </div>
      )}
      <header className="shared-fixtures__header">
        <p className="shared-fixtures__eyebrow">Shared view · read only</p>
        <h1 className="shared-fixtures__title">{name || "Tournament"}</h1>
        <p className="shared-fixtures__subtitle">{modeLabel}</p>
        <button type="button" className="btn-text shared-fixtures__refresh" onClick={() => load()}>
          Refresh
        </button>
        {lastUpdated && (
          <p className="shared-fixtures__updated">
            Updated {lastUpdated.toLocaleTimeString()} · auto-refresh every 30s
          </p>
        )}
      </header>

      {isLeagueMode(mode) && (
        <div className="league-content shared-fixtures__content">
          <div className="league-tabs">
            <button
              type="button"
              className={`league-tab ${leagueTab === "fixtures" ? "league-tab--active" : ""}`}
              onClick={() => setLeagueTab("fixtures")}
            >
              Fixtures
            </button>
            <button
              type="button"
              className={`league-tab ${leagueTab === "standings" ? "league-tab--active" : ""}`}
              onClick={() => setLeagueTab("standings")}
            >
              Standings
            </button>
            {showTiebreakerTab && (
              <button
                type="button"
                className={`league-tab ${leagueTab === "tiebreaker" ? "league-tab--active" : ""}`}
                onClick={() => setLeagueTab("tiebreaker")}
              >
                Tiebreaker
              </button>
            )}
          </div>
          <div className="export-sheet">
            <header className="export-sheet__header">
              <p className="export-sheet__eyebrow">{exportEyebrow}</p>
              <h2 className="export-sheet__title">{name || "Tournament"}</h2>
              <p className="export-sheet__subtitle">
                {leagueTab === "standings"
                  ? "Standings table"
                  : leagueTab === "tiebreaker"
                    ? "Tiebreaker league"
                    : "Match schedule"}
              </p>
            </header>
            <div className="export-sheet__body">
              {leagueTab === "fixtures" && (
                <div className="panel-card panel-card--fixtures">
                  <h3 className="section-title">Match fixtures</h3>
                  <LeagueMatches matches={regularMatches} readOnly />
                </div>
              )}
              {leagueTab === "standings" && (
                <div className="panel-card panel-card--standings">
                  <h3 className="section-title">Standings</h3>
                  <LeagueTable table={tableData} onViewDetails={setDetailTeam} />
                </div>
              )}
              {leagueTab === "tiebreaker" && showTiebreakerTab && (
                <div className="panel-card panel-card--tiebreaker">
                  <h3 className="section-title">Tiebreaker league</h3>
                  <LeagueTiebreakerPanel
                    tiedTeams={tiebreakerTeams}
                    tiebreakerMatches={tiebreakerMatches}
                    tiebreakerTable={tiebreakerTableData}
                    playoffStarted={
                      finishInfo.tiebreakerStarted || hasTiebreakerHistory(tiebreakerMatches)
                    }
                    needsNextRound={finishInfo.tiebreakerNeedsNextRound}
                    completed={finishInfo.finished && finishInfo.hadTiebreaker}
                    onViewDetails={setTiebreakerDetailTeam}
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isKnockoutMode(mode) && (
        <div className="shared-fixtures__content knockout-panel">
          <div className="knockout-panel__capture">
            <div className="bracket-scroll">
              <KnockoutBracket rounds={knockoutRounds} readOnly />
            </div>
            {champion && (
              <h2 className="champion-banner knockout-panel__champion">
                Champion — {champion}
              </h2>
            )}
          </div>
        </div>
      )}

      {detailTeam && (
        <LeagueTeamDetailModal
          teamName={detailTeam}
          stats={tableData[detailTeam]}
          matches={regularMatches}
          tournamentName={name}
          onClose={() => setDetailTeam(null)}
        />
      )}

      {tiebreakerDetailTeam && (
        <LeagueTeamDetailModal
          teamName={tiebreakerDetailTeam}
          stats={tiebreakerTableData[tiebreakerDetailTeam]}
          matches={tiebreakerMatches}
          tournamentName={name}
          onClose={() => setTiebreakerDetailTeam(null)}
        />
      )}
    </div>
  );
}
