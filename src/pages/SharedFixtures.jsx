import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LeagueMatches from "../components/LeagueMatches";
import LeagueTable from "../components/LeagueTable";
import KnockoutBracket from "../components/KnockoutBracket";
import LeagueTeamDetailModal from "../components/LeagueTeamDetailModal";
import { fetchTournament } from "../services/tournamentService";
import { decodeFromDatabase } from "../lib/tournamentPersistence";
import { calculateLeagueTable } from "../lib/leagueTable";
import {
  getModeLabel,
  isKnockoutMode,
  isLeagueMode,
  MODES,
} from "../lib/tournamentModes";
import { getChampion } from "../lib/knockoutBracket";
import "../App.css";

export default function SharedFixtures() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leagueTab, setLeagueTab] = useState("fixtures");
  const [detailTeam, setDetailTeam] = useState(null);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const row = await fetchTournament(id);
      if (!row.share_enabled) {
        setError("This share link is not active. Ask the organizer to copy a new link.");
        setData(null);
        return;
      }
      const decoded = decodeFromDatabase(row);
      const hasFixtures =
        decoded.matches.length > 0 || decoded.knockout_rounds.length > 0;
      if (!hasFixtures) {
        setError("No fixtures have been published yet.");
        setData(null);
        return;
      }
      setData(decoded);
    } catch {
      setError("Could not load fixtures. The link may be invalid or sharing may be disabled.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" aria-hidden="true" />
        <p>Loading fixtures…</p>
      </div>
    );
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
  const modeLabel = getModeLabel(mode);
  const exportEyebrow =
    mode === MODES.CUSTOM_LEAGUE
      ? "Custom League"
      : mode === MODES.CUSTOM_KNOCKOUT
        ? "Custom Knockout"
        : isKnockoutMode(mode)
          ? "Knockout"
          : "League";
  const tableData = calculateLeagueTable(teams, matches);
  const champion = getChampion(knockoutRounds);

  return (
    <div className="shared-fixtures">
      <header className="shared-fixtures__header">
        <p className="shared-fixtures__eyebrow">Shared view · read only</p>
        <h1 className="shared-fixtures__title">{name || "Tournament"}</h1>
        <p className="shared-fixtures__subtitle">{modeLabel}</p>
        <button type="button" className="btn-text shared-fixtures__refresh" onClick={load}>
          Refresh
        </button>
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
          </div>
          <div className="export-sheet">
            <header className="export-sheet__header">
              <p className="export-sheet__eyebrow">{exportEyebrow}</p>
              <h2 className="export-sheet__title">{name || "Tournament"}</h2>
              <p className="export-sheet__subtitle">
                {leagueTab === "standings" ? "Standings table" : "Match schedule"}
              </p>
            </header>
            <div className="export-sheet__body">
              {leagueTab === "fixtures" && (
                <div className="panel-card panel-card--fixtures">
                  <h3 className="section-title">Match fixtures</h3>
                  <LeagueMatches matches={matches} readOnly />
                </div>
              )}
              {leagueTab === "standings" && (
                <div className="panel-card panel-card--standings">
                  <h3 className="section-title">Standings</h3>
                  <LeagueTable table={tableData} onViewDetails={setDetailTeam} />
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
          matches={matches}
          tournamentName={name}
          onClose={() => setDetailTeam(null)}
        />
      )}
    </div>
  );
}
