import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { exportElementFullContent } from "../lib/exportImage";
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
import {
  applyTeamAdditionToMatchData,
  applyTeamRemovalToMatchData,
} from "../lib/teamRosterUpdates";
import { useAuth } from "../context/AuthContext";
import { useSavedTeams } from "../hooks/useSavedTeams";
import { useTournamentData } from "../hooks/useTournamentData";
import { getAuthErrorMessage } from "../lib/authErrors";
import PageLoading from "../components/ui/PageLoading";
import CloseIconButton from "../components/ui/CloseIconButton";
import ShareFixturesButton from "../components/ShareFixturesButton";
import SaveStatusIndicator from "../components/SaveStatusIndicator";
import DatabaseSetupAlert from "../components/DatabaseSetupAlert";
import { calculateLeagueTable } from "../lib/leagueTable";
import { applyBinaryLeagueScore } from "../lib/leagueScores";
import { getTournamentFinishInfo } from "../lib/tournamentCompletion";
import TournamentFinishScene from "../components/TournamentFinishScene";
import LeagueTiebreakerPanel from "../components/LeagueTiebreakerPanel";
import {
  buildTiebreakerLeagueMatches,
  calculateTiebreakerTableFromMatches,
  getTiebreakerParticipantNames,
  hasTiebreakerHistory,
  removeTiebreakerMatches,
  splitMatches,
} from "../lib/leagueTiebreaker";

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
  const [tiebreakerDetailTeam, setTiebreakerDetailTeam] = useState(null);
  const [draftLeagueMatches, setDraftLeagueMatches] = useState([]);
  const [draftKnockoutPairings, setDraftKnockoutPairings] = useState([]);
  const [error, setError] = useState("");
  const [showFinishScene, setShowFinishScene] = useState(false);
  const wasFinishedRef = useRef(false);

  const {
    loading,
    loadError,
    saveStatus,
    saveError,
    modeSetupRequired,
    shareEnabled,
    setShareEnabled,
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
    retrySave,
  } = useTournamentData(tournamentId);

  const {
    savedTeams,
    loading: savedLoading,
    error: savedTeamsError,
    addSavedTeam,
    renameSavedTeam,
  } = useSavedTeams(user?.id);

  const { regularMatches, tiebreakerMatches } = useMemo(
    () => splitMatches(matches),
    [matches]
  );

  const isStarted =
    regularMatches.length > 0 || knockoutRounds.length > 0;

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
    } else if (isLeagueMode(mode) && regularMatches.length > 0 && leagueExportRef.current) {
      target = leagueExportRef.current;
      suffix =
        leagueTab === "standings"
          ? "league-table"
          : leagueTab === "tiebreaker"
            ? "league-tiebreaker"
            : "league-fixtures";
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
      await exportElementFullContent(target, `${safeName}-${suffix}.png`, {
        width: target.offsetWidth,
        frameElement: target,
        expandHorizontal: isKnockoutMode(mode),
      });
    } catch (err) {
      setError(err.message || "Could not export image.");
    } finally {
      setExporting(false);
    }
  };

  const addTeamToRoster = (newTeam) => {
    setTeams((prev) => {
      if (prev.some((t) => t.id === newTeam.id)) return prev;
      const updatedTeams = [...prev, newTeam];
      applyTeamAdditionToMatchData({
        teams: updatedTeams,
        newTeam,
        mode,
        isStarted,
        setMatches,
      });
      return updatedTeams;
    });
  };

  const removeTeamById = (teamId, { confirm = true } = {}) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    if (
      confirm &&
      isStarted &&
      !window.confirm(
        "Remove this team? Their fixtures and results will be removed; other teams stay unchanged."
      )
    ) {
      return;
    }

    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    if (isStarted) {
      applyTeamRemovalToMatchData({
        teamName: team.name,
        mode,
        setMatches,
        setKnockoutRounds,
        setDraftLeagueMatches,
        setDraftKnockoutPairings,
      });
    }
  };

  const toggleSavedTeam = (savedTeam) => {
    const exists = teams.some((t) => t.id === savedTeam.id);
    if (exists) {
      removeTeamById(savedTeam.id, { confirm: isStarted });
    } else {
      addTeamToRoster({ id: savedTeam.id, name: savedTeam.name });
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
      addTeamToRoster({ id: row.id, name: row.name });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const removeFromTournament = (teamId) => {
    removeTeamById(teamId);
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
      regularMatches.length > 0 &&
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
        m.id === matchId ? applyBinaryLeagueScore(m, team, value) : m
      )
    );
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

  const tableData = calculateLeagueTable(teams, regularMatches);

  const finishInfo = useMemo(
    () =>
      getTournamentFinishInfo({
        mode,
        matches,
        knockoutRounds,
        table: tableData,
      }),
    [mode, matches, knockoutRounds, tableData]
  );

  const showTiebreakerTab =
    hasTiebreakerHistory(tiebreakerMatches) || finishInfo.needsTiebreaker;

  const tiebreakerTeams =
    finishInfo.tiedTeams?.length > 0
      ? finishInfo.tiedTeams
      : getTiebreakerParticipantNames(tiebreakerMatches);

  const tiebreakerTableData = useMemo(() => {
    if (!tiebreakerMatches.length) return {};
    return (
      finishInfo.tiebreakerTable ||
      calculateTiebreakerTableFromMatches(tiebreakerMatches)
    );
  }, [tiebreakerMatches, finishInfo.tiebreakerTable]);

  useEffect(() => {
    if (!finishInfo.finished) {
      wasFinishedRef.current = false;
      setShowFinishScene(false);
      if (finishInfo.needsTiebreaker && isLeagueMode(mode)) {
        setLeagueTab("tiebreaker");
      }
      return;
    }
    if (!wasFinishedRef.current) {
      setShowFinishScene(true);
      if (isLeagueMode(mode)) setLeagueTab("standings");
    }
    wasFinishedRef.current = true;
  }, [finishInfo.finished, finishInfo.needsTiebreaker, mode]);

  const startTiebreaker = () => {
    if (!finishInfo.tiedTeams?.length) return;
    const newFixtures = buildTiebreakerLeagueMatches(
      finishInfo.tiedTeams,
      tiebreakerMatches
    );
    if (!newFixtures.length) return;
    setMatches((prev) => [...prev, ...newFixtures]);
    setLeagueTab("tiebreaker");
  };

  const resetTiebreaker = () => {
    if (!window.confirm("Reset the tiebreaker league?")) return;
    setMatches((prev) => removeTiebreakerMatches(prev));
    setTiebreakerDetailTeam(null);
  };

  if (loading) {
    return <PageLoading message="Loading tournament…" />;
  }

  if (loadError) {
    return (
      <div className="shared-fixtures shared-fixtures--error">
        <div className="shared-fixtures__card">
          <h1 className="shared-fixtures__title">Tournament unavailable</h1>
          <p className="shared-fixtures__message">{loadError}</p>
          <button type="button" className="btn-action" onClick={() => navigate("/")}>
            Back to dashboard
          </button>
        </div>
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
          {saveError && (
            <div className="auth-form__alert auth-form__alert--error" role="alert">
              {saveError}
            </div>
          )}
          {modeSetupRequired && <DatabaseSetupAlert />}
          <SaveStatusIndicator status={saveStatus} onRetry={retrySave} />
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
      <div ref={leagueExportRef} className="export-sheet">
        <header className="export-sheet__header">
          <p className="export-sheet__eyebrow">{exportEyebrow}</p>
          <h2 className="export-sheet__title">{tournamentName}</h2>
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
              <LeagueMatches matches={regularMatches} onScoreChange={handleScoreChange} />
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
                playoffStarted={finishInfo.tiebreakerStarted || hasTiebreakerHistory(tiebreakerMatches)}
                needsNextRound={finishInfo.tiebreakerNeedsNextRound}
                completed={finishInfo.finished && finishInfo.hadTiebreaker}
                onStart={startTiebreaker}
                onScoreChange={handleScoreChange}
                onViewDetails={setTiebreakerDetailTeam}
                onReset={resetTiebreaker}
              />
            </div>
          )}
        </div>
      </div>
      <div className="league-content__actions">
        <ShareFixturesButton
          tournamentId={tournamentId}
          disabled={regularMatches.length === 0}
          shareEnabled={shareEnabled}
          onShareEnabledChange={setShareEnabled}
        />
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
        <ShareFixturesButton
          tournamentId={tournamentId}
          disabled={knockoutRounds.length === 0}
          shareEnabled={shareEnabled}
          onShareEnabledChange={setShareEnabled}
        />
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
          <SaveStatusIndicator status={saveStatus} onRetry={retrySave} />
        </div>
      </header>

      {(error || saveError) && (
        <div className="app-banner app-banner--error" role="alert">
          {error || saveError}
          <button type="button" onClick={() => setError("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      {modeSetupRequired && (
        <div className="app-banner app-banner--setup">
          <DatabaseSetupAlert />
        </div>
      )}
      {savedTeamsError && (
        <div className="app-banner app-banner--error" role="alert">
          {savedTeamsError}
        </div>
      )}

      <aside
        className={`sidebar-panel ${mobileTeamsOpen ? "sidebar-panel--open" : ""}`}
        aria-label="Teams roster"
      >
        <div className="panel-card sidebar-panel__inner">
          <div className="sidebar-panel__head">
            <h3 className="section-title">Teams</h3>
            <CloseIconButton
              className="sidebar-panel__close icon-btn--close-sm"
              size={18}
              label="Close teams panel"
              onClick={() => setMobileTeamsOpen(false)}
            />
          </div>
          <TeamForm onAddTeam={addNewTeam} />
          <TeamList
            teams={teams}
            onDelete={removeFromTournament}
            onRename={renameTeam}
          />
          <div className="sidebar-actions">
            <div className="sidebar-actions__group">
              <button
                type="button"
                className="mode-btn sidebar-actions__btn"
                onClick={() => navigate("/guide")}
              >
                Concierge guide
              </button>
              <button
                type="button"
                className="mode-btn mode-btn--coffee sidebar-actions__btn"
                onClick={() => navigate("/coffee")}
              >
                Buy me a coffee
              </button>
            </div>
            <div className="sidebar-actions__group">
              <button
                type="button"
                className="mode-btn btn-action sidebar-actions__btn"
                onClick={takeScreenshot}
                disabled={exporting}
              >
                {exporting ? "Exporting…" : "Save screenshot"}
              </button>
              <button
                type="button"
                className="btn-reset mode-btn sidebar-actions__btn"
                onClick={resetTournamentData}
              >
                Reset all
              </button>
            </div>
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
        {view === "game" && finishInfo.needsTiebreaker && (
          <button
            type="button"
            className="finish-banner finish-banner--tie"
            onClick={() => setLeagueTab("tiebreaker")}
          >
            <span className="finish-banner__label">Tie at the top</span>
            <span className="finish-banner__winner">{finishInfo.tiedTeams?.join(" · ")}</span>
            <span className="finish-banner__cta">Play tiebreaker league</span>
          </button>
        )}
        {view === "game" && finishInfo.finished && !showFinishScene && (
          <button
            type="button"
            className="finish-banner"
            onClick={() => setShowFinishScene(true)}
          >
            <span className="finish-banner__label">Tournament complete</span>
            <span className="finish-banner__winner">
              {finishInfo.winners.join(" · ")}
            </span>
            <span className="finish-banner__cta">View celebration</span>
          </button>
        )}
        <main className="main-panel">
          {mode === MODES.LEAGUE && (
            <>
              {regularMatches.length === 0 ? (
                <div className="empty-state">
                  <h3>{teams.length} teams ready</h3>
                  <button type="button" className="btn-action" onClick={generateLeagueMatches}>
                    Start league season
                  </button>
                </div>
              ) : (
                renderLeagueGame("Regenerate fixtures", () => {
                  setMatches([]);
                  setKnockoutRounds([]);
                })
              )}
            </>
          )}

          {mode === MODES.CUSTOM_LEAGUE && (
            <>
              {regularMatches.length === 0 ? (
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
                  setKnockoutRounds([]);
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
        {isLeagueMode(mode) && regularMatches.length > 0 && (
          <>
            <button
              type="button"
              className={leagueTab === "standings" ? "is-active" : ""}
              onClick={() => setLeagueTab("standings")}
            >
              Table
            </button>
            {showTiebreakerTab && (
              <button
                type="button"
                className={leagueTab === "tiebreaker" ? "is-active" : ""}
                onClick={() => setLeagueTab("tiebreaker")}
              >
                Tiebreak
              </button>
            )}
          </>
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

      {showFinishScene && finishInfo.finished && view === "game" && (
        <TournamentFinishScene
          tournamentName={tournamentName}
          modeLabel={modeLabel}
          teamCount={teams.length}
          winners={finishInfo.winners}
          subtitle={finishInfo.subtitle}
          tournamentId={tournamentId}
          shareEnabled={shareEnabled}
          onShareEnabledChange={setShareEnabled}
          onClose={() => setShowFinishScene(false)}
        />
      )}

      {detailTeam && (
        <LeagueTeamDetailModal
          teamName={detailTeam}
          stats={tableData[detailTeam]}
          matches={regularMatches}
          tournamentName={tournamentName}
          onClose={() => setDetailTeam(null)}
        />
      )}

      {tiebreakerDetailTeam && (
        <LeagueTeamDetailModal
          teamName={tiebreakerDetailTeam}
          stats={tiebreakerTableData[tiebreakerDetailTeam]}
          matches={tiebreakerMatches}
          tournamentName={tournamentName}
          onClose={() => setTiebreakerDetailTeam(null)}
        />
      )}
    </div>
  );
}
