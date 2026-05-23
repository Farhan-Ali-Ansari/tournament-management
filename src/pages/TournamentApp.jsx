import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { exportScreenHD } from "../lib/exportImage";
import TeamForm from "../components/TeamForm";
import TeamList from "../components/TeamList";
import TournamentTeamPicker from "../components/TournamentTeamPicker";
import LeagueMatches from "../components/LeagueMatches";
import LeagueTable from "../components/LeagueTable";
import KnockoutBracket from "../components/KnockoutBracket";
import CustomMatchBuilder from "../components/CustomMatchBuilder";
import CustomKnockoutBuilder from "../components/CustomKnockoutBuilder";
import LeagueTeamDetailModal from "../components/LeagueTeamDetailModal";
import {
  buildFullBracket,
  buildBracketFromRound0,
  setMatchWinner,
  clearMatchWinner,
  getChampion,
} from "../lib/knockoutBracket";
import {
  MODES,
  getModeLabel,
  isLeagueMode,
  isKnockoutMode,
} from "../lib/tournamentModes";
import { useAuth } from "../context/AuthContext";
import { useSavedTeams } from "../hooks/useSavedTeams";
import { useTournamentData } from "../hooks/useTournamentData";
import { getAuthErrorMessage } from "../lib/authErrors";
import "../App.css";

const VIEW_FROM_PATH = {
  setup: "setup",
  teams: "teams",
  game: "game",
};

function hasTournamentName(name) {
  return Boolean(name?.trim());
}

export default function TournamentApp() {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const leagueExportRef = useRef(null);
  const knockoutExportRef = useRef(null);
  const bracketScrollRef = useRef(null);
  const [mobileTeamsOpen, setMobileTeamsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const pathView = location.pathname.split("/").pop();
  const initialView = VIEW_FROM_PATH[pathView] || "setup";

  const [view, setView] = useState(initialView);
  const [leagueTab, setLeagueTab] = useState("fixtures");
  const [detailTeam, setDetailTeam] = useState(null);
  const [draftLeagueMatches, setDraftLeagueMatches] = useState([]);
  const [draftKnockoutPairings, setDraftKnockoutPairings] = useState([]);

  const {
    loading,
    saving,
    error,
    setError,
    tournamentName,
    setTournamentName,
    teams,
    setTeams,
    matches,
    setMatches,
    mode,
    setMode,
    knockoutRounds,
    setKnockoutRounds,
    persist,
  } = useTournamentData(tournamentId);

  const {
    savedTeams,
    loading: savedLoading,
    addSavedTeam,
    renameSavedTeam,
  } = useSavedTeams(user?.id);

  const isStarted =
    matches.length > 0 || knockoutRounds.length > 0;

  useEffect(() => {
    const v = VIEW_FROM_PATH[pathView];
    if (v) setView(v);
  }, [pathView]);

  // Horizontal scroll stays on .bracket-scroll; forward vertical wheel to the page.
  useEffect(() => {
    const el = bracketScrollRef.current;
    if (!el || view !== "game" || !isKnockoutMode(mode) || knockoutRounds.length === 0) {
      return undefined;
    }

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      window.scrollBy({ top: e.deltaY, left: 0 });
      e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [view, mode, knockoutRounds.length]);

  const goTo = (nextView) => {
    setView(nextView);
    navigate(`/tournament/${tournamentId}/${nextView}`);
  };

  const pickMode = (selectedMode) => {
    if (isStarted) return;
    setMode(selectedMode);
    setMatches([]);
    setKnockoutRounds([]);
    setDraftLeagueMatches([]);
    setDraftKnockoutPairings([]);
    setError("");
  };

  const takeScreenshot = async () => {
    let target = null;
    let suffix = "tournament";

    if (isKnockoutMode(mode) && knockoutRounds.length > 0 && knockoutExportRef.current) {
      target = knockoutExportRef.current;
      suffix = "knockout-bracket";
    } else if (isLeagueMode(mode) && matches.length > 0 && leagueExportRef.current) {
      target = leagueExportRef.current;
      suffix = leagueTab === "standings" ? "league-table" : "league-fixtures";
    }

    if (!target) {
      setError("Nothing to export yet. Start fixtures or the bracket first.");
      return;
    }

    setExporting(true);
    setError("");
    try {
      const safeName = (tournamentName || "tournament")
        .trim()
        .replace(/[^\w-]+/g, "-")
        .slice(0, 48);
      await exportScreenHD(target, `${safeName}-${suffix}.png`, {
        scrollContainer:
          isKnockoutMode(mode) ? bracketScrollRef.current : target,
      });
    } catch (err) {
      setError(err.message || "Could not export image.");
    } finally {
      setExporting(false);
    }
  };

  const toggleSavedTeam = (savedTeam) => {
    const exists = teams.some((t) => t.id === savedTeam.id);
    if (exists) {
      setTeams((prev) => prev.filter((t) => t.id !== savedTeam.id));
    } else {
      setTeams((prev) => [...prev, { id: savedTeam.id, name: savedTeam.name }]);
    }
    setError("");
  };

  const addNewTeam = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Team name cannot be empty.");
    if (teams.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      return setError("Team already in this tournament.");
    }
    setError("");
    try {
      const existing = savedTeams.find(
        (t) => t.name.toLowerCase() === trimmed.toLowerCase()
      );
      const row = existing || (await addSavedTeam(trimmed));
      setTeams((prev) => [...prev, { id: row.id, name: row.name }]);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const removeFromTournament = (teamId) => {
    if (
      isStarted &&
      !window.confirm("Remove this team? Match data will be reset.")
    ) {
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (isStarted) {
      setMatches([]);
      setKnockoutRounds([]);
    }
  };

  const renameTeam = async (teamId, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const team = teams.find((t) => t.id === teamId);
    if (!team || team.name === trimmed) return;
    if (
      teams.some(
        (t) => t.id !== teamId && t.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      return setError("A team with this name is already in the tournament.");
    }
    setError("");
    const oldName = team.name;
    const isSaved = savedTeams.some((t) => t.id === teamId);
    try {
      if (isSaved) await renameSavedTeam(teamId, trimmed);
    } catch (err) {
      setError(getAuthErrorMessage(err));
      return;
    }
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, name: trimmed } : t))
    );
    setMatches((prev) =>
      prev.map((m) => ({
        ...m,
        teamA: m.teamA === oldName ? trimmed : m.teamA,
        teamB: m.teamB === oldName ? trimmed : m.teamB,
      }))
    );
    setKnockoutRounds((prev) =>
      prev.map((round) =>
        round.map((m) => ({
          ...m,
          teamA: m.teamA === oldName ? trimmed : m.teamA,
          teamB: m.teamB === oldName ? trimmed : m.teamB,
          winner: m.winner === oldName ? trimmed : m.winner,
        }))
      )
    );
  };

  const generateLeagueMatches = () => {
    if (teams.length < 2) return setError("Need at least 2 teams.");
    if (
      matches.length > 0 &&
      !window.confirm("This will overwrite current scores. Continue?")
    ) {
      return;
    }
    setError("");
    setKnockoutRounds([]);
    setMode(MODES.LEAGUE);
    const list = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        list.push({
          id: `${teams[i].id}-${teams[j].id}`,
          teamA: teams[i].name,
          teamB: teams[j].name,
          scoreA: "",
          scoreB: "",
        });
      }
    }
    setMatches(list);
  };

  const handleScoreChange = (matchId, team, value) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              scoreA: team === "A" ? value : m.scoreA,
              scoreB: team === "B" ? value : m.scoreB,
            }
          : m
      )
    );
  };

  const calculateTable = () => {
    const table = {};
    teams.forEach((t) => {
      table[t.name] = { played: 0, won: 0, draw: 0, lost: 0, points: 0 };
    });
    matches.forEach((m) => {
      if (m.scoreA === "" || m.scoreB === "") return;
      const a = Number(m.scoreA);
      const b = Number(m.scoreB);
      if (!table[m.teamA] || !table[m.teamB]) return;
      table[m.teamA].played++;
      table[m.teamB].played++;
      if (a > b) {
        table[m.teamA].won++;
        table[m.teamA].points += 3;
        table[m.teamB].lost++;
      } else if (a < b) {
        table[m.teamB].won++;
        table[m.teamB].points += 3;
        table[m.teamA].lost++;
      } else {
        table[m.teamA].draw++;
        table[m.teamB].draw++;
        table[m.teamA].points++;
        table[m.teamB].points++;
      }
    });
    return Object.entries(table)
      .sort(([, a], [, b]) => b.won - a.won || a.lost - b.lost || b.played - a.played)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  };

  const startKnockout = () => {
    if (teams.length < 2) return setError("Need at least 2 teams.");
    setError("");
    setMatches([]);
    setMode(MODES.KNOCKOUT);
    setKnockoutRounds(buildFullBracket(teams));
  };

  const startCustomLeague = () => {
    if (draftLeagueMatches.length === 0) {
      return setError("Add at least one fixture.");
    }
    setError("");
    setKnockoutRounds([]);
    setMatches(draftLeagueMatches);
    setDraftLeagueMatches([]);
  };

  const startCustomKnockout = () => {
    if (draftKnockoutPairings.length === 0) {
      return setError("Add at least one first-round match.");
    }
    setError("");
    setMatches([]);
    setKnockoutRounds(buildBracketFromRound0(draftKnockoutPairings));
    setDraftKnockoutPairings([]);
  };

  const selectWinner = (roundIndex, matchId, winner) => {
    setKnockoutRounds((prev) => setMatchWinner(prev, roundIndex, matchId, winner));
  };

  const undoWinner = (roundIndex, matchId) => {
    setKnockoutRounds((prev) => clearMatchWinner(prev, roundIndex, matchId));
  };

  const resetTournamentData = async () => {
    if (!window.confirm("Reset all teams and match data for this tournament?")) {
      return;
    }
    setTeams([]);
    setMatches([]);
    setKnockoutRounds([]);
    setDraftLeagueMatches([]);
    setDraftKnockoutPairings([]);
    setMode(MODES.LEAGUE);
    await persist({
      name: tournamentName,
      mode: MODES.LEAGUE,
      teams: [],
      matches: [],
      knockout_rounds: [],
    });
    goTo("setup");
  };

  const goToTeams = () => {
    if (!hasTournamentName(tournamentName)) {
      return setError("Enter a tournament name to continue.");
    }
    if (!mode) return setError("Choose a format first.");
    setError("");
    goTo("teams");
  };

  const goToGame = () => {
    if (!hasTournamentName(tournamentName)) {
      return setError("Enter a tournament name to continue.");
    }
    if (teams.length < 2) return setError("Select at least 2 teams.");
    setError("");
    if (isLeagueMode(mode)) setKnockoutRounds([]);
    else setMatches([]);
    goTo("game");
  };

  const tableData = calculateTable();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" aria-hidden="true" />
        <p>Loading tournament…</p>
      </div>
    );
  }

  const nameIsValid = hasTournamentName(tournamentName);

  if (view === "setup") {
    return (
      <div className="splash-screen">
        <div className="wizard-card wizard-card--wide">
          <button
            type="button"
            className="btn-text wizard-back-home"
            onClick={() => navigate("/")}
          >
            ← All tournaments
          </button>
          <label className="tournament-name-field">
            <span className="tournament-name-field__label">
              Tournament name <span className="tournament-name-field__required">*</span>
            </span>
            <input
              type="text"
              className={`team-form__input ${!nameIsValid && tournamentName.length > 0 ? "team-form__input--invalid" : ""}`}
              value={tournamentName}
              onChange={(e) => {
                setTournamentName(e.target.value);
                if (error && hasTournamentName(e.target.value)) setError("");
              }}
              placeholder="Enter Tournament Name"
              required
              aria-required="true"
              autoComplete="off"
            />
            {!nameIsValid && (
              <span className="tournament-name-field__hint">Required before you continue</span>
            )}
          </label>
          <h2 className="section-title wizard-step-title">Step 1: Choose format</h2>
          <p className="wizard-hint">
            Pick a format. <strong>Custom</strong> modes let you choose which teams play in each match.
          </p>
          {isStarted && (
            <div className="auth-form__alert auth-form__alert--error" role="status">
              Tournament already started — format cannot be changed. Use Reset to start over.
            </div>
          )}
          {error && (
            <div className="auth-form__alert auth-form__alert--error" role="alert">
              {error}
            </div>
          )}
          <div className="selection-buttons mode-pick--grid">
            <button
              type="button"
              className={`btn-card ${mode === MODES.LEAGUE ? "btn-card--selected" : ""}`}
              onClick={() => pickMode(MODES.LEAGUE)}
              disabled={isStarted}
            >
              League
              <span className="btn-card__desc">All teams play each other</span>
            </button>
            <button
              type="button"
              className={`btn-card ${mode === MODES.KNOCKOUT ? "btn-card--selected" : ""}`}
              onClick={() => pickMode(MODES.KNOCKOUT)}
              disabled={isStarted}
            >
              Knockout
              <span className="btn-card__desc">Auto single-elimination bracket</span>
            </button>
            <button
              type="button"
              className={`btn-card ${mode === MODES.CUSTOM_LEAGUE ? "btn-card--selected" : ""}`}
              onClick={() => pickMode(MODES.CUSTOM_LEAGUE)}
              disabled={isStarted}
            >
              Custom League
              <span className="btn-card__desc">Pick your own fixtures</span>
            </button>
            <button
              type="button"
              className={`btn-card ${mode === MODES.CUSTOM_KNOCKOUT ? "btn-card--selected" : ""}`}
              onClick={() => pickMode(MODES.CUSTOM_KNOCKOUT)}
              disabled={isStarted}
            >
              Custom Knockout
              <span className="btn-card__desc">Pick first-round pairings</span>
            </button>
          </div>
          <div className="wizard-footer">
            <button
              type="button"
              className="btn-primary-large"
              onClick={goToTeams}
              disabled={!nameIsValid}
              style={{ opacity: nameIsValid ? 1 : 0.5 }}
            >
              Next: Choose teams →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === "teams") {
    return (
      <div className="splash-screen">
        <div className="wizard-card wizard-card--wide">
          <button
            type="button"
            className="btn-text wizard-back-home"
            onClick={() => navigate("/")}
          >
            ← All tournaments
          </button>
          <h2 className="section-title wizard-step-title">Step 2: Teams</h2>
          <p className="wizard-hint">
            Format: <strong>{getModeLabel(mode)}</strong> · {tournamentName}
          </p>
          {error && (
            <div className="auth-form__alert auth-form__alert--error" role="alert">
              {error}
            </div>
          )}
          {saving && <p className="save-indicator">Saving…</p>}
          <TournamentTeamPicker
            savedTeams={savedTeams}
            savedLoading={savedLoading}
            tournamentTeams={teams}
            onAddNewTeam={addNewTeam}
            onToggleSavedTeam={toggleSavedTeam}
            onRemoveFromTournament={removeFromTournament}
            onRenameInTournament={renameTeam}
          />
          <div className="wizard-footer wizard-footer--split">
            <button type="button" className="btn-text" onClick={() => goTo("setup")}>
              ← Format
            </button>
            <button
              type="button"
              className="btn-primary-large"
              style={{ opacity: teams.length < 2 || !nameIsValid ? 0.5 : 1 }}
              disabled={teams.length < 2 || !nameIsValid}
              onClick={goToGame}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const modeLabel = getModeLabel(mode);
  const exportEyebrow =
    mode === MODES.CUSTOM_LEAGUE
      ? "Custom League"
      : mode === MODES.CUSTOM_KNOCKOUT
        ? "Custom Knockout"
        : isKnockoutMode(mode)
          ? "Knockout"
          : "League";

  const renderLeagueGame = (regenerateLabel, onRegenerate) => (
    <div className="league-content">
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
      <div ref={leagueExportRef} className="export-sheet">
        <header className="export-sheet__header">
          <p className="export-sheet__eyebrow">{exportEyebrow}</p>
          <h2 className="export-sheet__title">{tournamentName}</h2>
          <p className="export-sheet__subtitle">
            {leagueTab === "standings" ? "Standings table" : "Match schedule"}
          </p>
        </header>
        <div className="export-sheet__body">
          {leagueTab === "fixtures" && (
            <div className="panel-card panel-card--fixtures">
              <h3 className="section-title">Match fixtures</h3>
              <LeagueMatches matches={matches} onScoreChange={handleScoreChange} />
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
      <div className="league-content__actions">
        <button type="button" className="btn-reset mode-btn" onClick={onRegenerate}>
          {regenerateLabel}
        </button>
        <button
          type="button"
          className="mode-btn btn-action"
          onClick={takeScreenshot}
          disabled={exporting}
        >
          {exporting ? "Exporting…" : "Save screenshot"}
        </button>
      </div>
    </div>
  );

  const renderKnockoutGame = (onReset, resetLabel = "Reset bracket") => (
    <>
      <div className="knockout-panel">
        <div ref={knockoutExportRef} className="knockout-panel__capture">
          <div ref={bracketScrollRef} className="bracket-scroll">
            <KnockoutBracket
              rounds={knockoutRounds}
              onSelectWinner={selectWinner}
              onUndoWinner={undoWinner}
            />
          </div>
          {(() => {
            const champion = getChampion(knockoutRounds);
            return champion ? (
              <h2 className="champion-banner knockout-panel__champion">
                Champion — {champion}
              </h2>
            ) : null;
          })()}
        </div>
      </div>
      <div className="league-content__actions">
        <button type="button" className="btn-reset mode-btn" onClick={onReset}>
          {resetLabel}
        </button>
        <button
          type="button"
          className="mode-btn btn-action"
          onClick={takeScreenshot}
          disabled={exporting}
        >
          {exporting ? "Exporting…" : "Save screenshot"}
        </button>
      </div>
    </>
  );

  return (
    <div className="tournament-app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="header-top">
            <button
              type="button"
              onClick={() => goTo("teams")}
              className="btn-back"
            >
              ← Teams
            </button>
            <h1 className="app-title">{modeLabel}</h1>
            <button
              type="button"
              className="btn-back btn-back--right"
              onClick={() => navigate("/")}
              aria-label="All tournaments"
            >
              Home
            </button>
          </div>
          <p className="app-header__subtitle">
            {tournamentName} · <span className="mode-badge">{modeLabel} only</span>
          </p>
          {saving && <p className="save-indicator save-indicator--header">Saving…</p>}
        </div>
      </header>

      {error && (
        <div className="app-banner app-banner--error" role="alert">
          {error}
          <button type="button" onClick={() => setError("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <aside
        className={`sidebar-panel ${mobileTeamsOpen ? "sidebar-panel--open" : ""}`}
        aria-label="Teams roster"
      >
        <div className="panel-card sidebar-panel__inner">
          <div className="sidebar-panel__head">
            <h3 className="section-title">Teams</h3>
            <button
              type="button"
              className="sidebar-panel__close"
              onClick={() => setMobileTeamsOpen(false)}
              aria-label="Close teams panel"
            >
              ×
            </button>
          </div>
          <TeamForm onAddTeam={addNewTeam} />
          <TeamList
            teams={teams}
            onDelete={removeFromTournament}
            onRename={renameTeam}
          />
          <div className="sidebar-actions">
            <button
              type="button"
              className="mode-btn"
              onClick={() => navigate("/guide")}
            >
              Concierge guide
            </button>
            <button
              type="button"
              className="mode-btn mode-btn--coffee"
              onClick={() => navigate("/coffee")}
            >
              Buy me a coffee
            </button>
            <button
              type="button"
              className="mode-btn btn-action"
              onClick={takeScreenshot}
              disabled={exporting}
            >
              {exporting ? "Exporting…" : "Save screenshot"}
            </button>
            <button type="button" className="btn-reset mode-btn" onClick={resetTournamentData}>
              Reset all
            </button>
          </div>
        </div>
      </aside>

      {mobileTeamsOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close teams panel"
          onClick={() => setMobileTeamsOpen(false)}
        />
      )}

      <div className="tournament-main">
        <main className="main-panel">
          {mode === MODES.LEAGUE && (
            <>
              {matches.length === 0 ? (
                <div className="empty-state">
                  <h3>{teams.length} teams ready</h3>
                  <button type="button" className="btn-action" onClick={generateLeagueMatches}>
                    Start league season
                  </button>
                </div>
              ) : (
                renderLeagueGame("Regenerate fixtures", () => setMatches([]))
              )}
            </>
          )}

          {mode === MODES.CUSTOM_LEAGUE && (
            <>
              {matches.length === 0 ? (
                <div className="empty-state empty-state--builder">
                  <h3>{teams.length} teams · build your fixtures</h3>
                  <CustomMatchBuilder
                    teams={teams}
                    matches={draftLeagueMatches}
                    onMatchesChange={setDraftLeagueMatches}
                    onStart={startCustomLeague}
                    startLabel="Start custom league"
                    emptyHint="Choose two teams per fixture. Add as many matches as you need."
                  />
                </div>
              ) : (
                renderLeagueGame("Edit fixtures", () => {
                  setDraftLeagueMatches(matches);
                  setMatches([]);
                })
              )}
            </>
          )}

          {mode === MODES.KNOCKOUT && (
            <>
              {knockoutRounds.length === 0 ? (
                <div className="empty-state">
                  <h3>{teams.length} teams ready</h3>
                  <button type="button" className="btn-action" onClick={startKnockout}>
                    Start knockout cup
                  </button>
                </div>
              ) : (
                renderKnockoutGame(() => setKnockoutRounds([]))
              )}
            </>
          )}

          {mode === MODES.CUSTOM_KNOCKOUT && (
            <>
              {knockoutRounds.length === 0 ? (
                <div className="empty-state empty-state--builder">
                  <h3>{teams.length} teams · build first round</h3>
                  <CustomKnockoutBuilder
                    teams={teams}
                    pairings={draftKnockoutPairings}
                    onPairingsChange={setDraftKnockoutPairings}
                    onStart={startCustomKnockout}
                  />
                </div>
              ) : (
                renderKnockoutGame(() => {
                  setDraftKnockoutPairings([]);
                  setKnockoutRounds([]);
                }, "Edit pairings")
              )}
            </>
          )}
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Quick actions">
        <button
          type="button"
          className={view === "teams" ? "is-active" : ""}
          onClick={() => goTo("teams")}
        >
          Teams
        </button>
        <button
          type="button"
          className={mobileTeamsOpen ? "is-active" : ""}
          onClick={() => setMobileTeamsOpen(true)}
        >
          Roster
        </button>
        {isLeagueMode(mode) && matches.length > 0 && (
          <button
            type="button"
            className={leagueTab === "standings" ? "is-active" : ""}
            onClick={() => setLeagueTab("standings")}
          >
            Table
          </button>
        )}
        <button
          type="button"
          onClick={takeScreenshot}
          disabled={exporting}
          aria-label="Save screenshot"
        >
          {exporting ? "…" : "Export"}
        </button>
      </nav>

      {detailTeam && (
        <LeagueTeamDetailModal
          teamName={detailTeam}
          stats={tableData[detailTeam]}
          matches={matches}
          onClose={() => setDetailTeam(null)}
        />
      )}
    </div>
  );
}
