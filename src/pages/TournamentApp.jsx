import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import TeamForm from "../components/TeamForm";
import TeamList from "../components/TeamList";
import TournamentTeamPicker from "../components/TournamentTeamPicker";
import LeagueMatches from "../components/LeagueMatches";
import LeagueTable from "../components/LeagueTable";
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

export default function TournamentApp() {
  const { id: tournamentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const screenshotRef = useRef(null);
  const [mobileTeamsOpen, setMobileTeamsOpen] = useState(false);

  const pathView = location.pathname.split("/").pop();
  const initialView = VIEW_FROM_PATH[pathView] || "setup";

  const [view, setView] = useState(initialView);
  const [leagueTab, setLeagueTab] = useState("fixtures");

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

  const goTo = (nextView) => {
    setView(nextView);
    navigate(`/tournament/${tournamentId}/${nextView}`);
  };

  const pickMode = (selectedMode) => {
    if (isStarted) return;
    setMode(selectedMode);
    setMatches([]);
    setKnockoutRounds([]);
    setError("");
  };

  const takeScreenshot = async () => {
    if (!screenshotRef.current) return;
    const canvas = await html2canvas(screenshotRef.current, {
      backgroundColor: "#08080a",
      scale: 2,
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `tournament-${tournamentId}-${Date.now()}.png`;
    link.click();
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
    setMode("league");
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
      .sort(([, a], [, b]) => b.won - a.won || a.lost - b.lost)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  };

  const generateKnockoutMatches = (currentTeams) => {
    const shuffled = [...currentTeams].sort(() => Math.random() - 0.5);
    const round = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        round.push({
          id: `${shuffled[i].name}-${shuffled[i + 1].name}`,
          teamA: shuffled[i].name,
          teamB: shuffled[i + 1].name,
          winner: "",
        });
      } else {
        round.push({
          id: `${shuffled[i].name}-bye`,
          teamA: shuffled[i].name,
          teamB: "BYE",
          winner: shuffled[i].name,
        });
      }
    }
    return round;
  };

  const startKnockout = () => {
    if (teams.length < 2) return setError("Need at least 2 teams.");
    setError("");
    setMatches([]);
    setMode("knockout");
    setKnockoutRounds([generateKnockoutMatches(teams)]);
  };

  const selectWinner = (roundIndex, matchId, winner) => {
    setKnockoutRounds((prev) => {
      const updated = [...prev];
      updated[roundIndex] = updated[roundIndex].map((m) =>
        m.id === matchId ? { ...m, winner } : m
      );
      const roundComplete = updated[roundIndex].every((m) => m.winner);
      if (roundComplete && updated.length === roundIndex + 1) {
        const winners = updated[roundIndex].map((m) => ({ name: m.winner }));
        if (winners.length > 1) {
          updated.push(generateKnockoutMatches(winners));
        }
      }
      return updated;
    });
  };

  const undoWinner = (roundIndex, matchId) => {
    setKnockoutRounds((prev) => {
      const updated = prev.slice(0, roundIndex + 1);
      updated[roundIndex] = updated[roundIndex].map((m) =>
        m.id === matchId ? { ...m, winner: "" } : m
      );
      return updated;
    });
  };

  const resetTournamentData = async () => {
    if (!window.confirm("Reset all teams and match data for this tournament?")) {
      return;
    }
    setTeams([]);
    setMatches([]);
    setKnockoutRounds([]);
    setMode("league");
    await persist({
      name: tournamentName,
      mode: "league",
      teams: [],
      matches: [],
      knockout_rounds: [],
    });
    goTo("setup");
  };

  const goToTeams = () => {
    if (!mode) return setError("Choose League or Knockout first.");
    setError("");
    goTo("teams");
  };

  const goToGame = () => {
    if (teams.length < 2) return setError("Select at least 2 teams.");
    setError("");
    if (mode === "league") setKnockoutRounds([]);
    else setMatches([]);
    goTo("game");
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" aria-hidden="true" />
        <p>Loading tournament…</p>
      </div>
    );
  }

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
            <span className="tournament-name-field__label">Tournament name</span>
            <input
              type="text"
              className="team-form__input"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder="My Tournament"
            />
          </label>
          <h2 className="section-title wizard-step-title">Step 1: Choose format</h2>
          <p className="wizard-hint">Each tournament is <strong>either</strong> League <strong>or</strong> Knockout — not both.</p>
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
          <div className="selection-buttons mode-pick--inline">
            <button
              type="button"
              className={`btn-card ${mode === "league" ? "btn-card--selected" : ""}`}
              onClick={() => pickMode("league")}
              disabled={isStarted}
            >
              League
            </button>
            <button
              type="button"
              className={`btn-card ${mode === "knockout" ? "btn-card--selected" : ""}`}
              onClick={() => pickMode("knockout")}
              disabled={isStarted}
            >
              Knockout
            </button>
          </div>
          <div className="wizard-footer">
            <button type="button" className="btn-primary-large" onClick={goToTeams}>
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
            Format: <strong>{mode === "knockout" ? "Knockout" : "League"}</strong> · {tournamentName}
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
              style={{ opacity: teams.length < 2 ? 0.5 : 1 }}
              disabled={teams.length < 2}
              onClick={goToGame}
            >
              Start {mode === "knockout" ? "knockout" : "league"} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const modeLabel = mode === "knockout" ? "Knockout" : "League";

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
            <button type="button" className="mode-btn btn-action" onClick={takeScreenshot}>
              Save image
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
        <main className="main-panel" ref={screenshotRef}>
          {mode === "league" && (
            <>
              {matches.length === 0 ? (
                <div className="empty-state">
                  <h3>{teams.length} teams ready</h3>
                  <button type="button" className="btn-action" onClick={generateLeagueMatches}>
                    Start league season
                  </button>
                </div>
              ) : (
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
                  {leagueTab === "fixtures" && (
                    <div className="panel-card panel-card--fixtures">
                      <h3 className="section-title">Match fixtures</h3>
                      <LeagueMatches matches={matches} onScoreChange={handleScoreChange} />
                    </div>
                  )}
                  {leagueTab === "standings" && (
                    <div className="panel-card panel-card--standings">
                      <h3 className="section-title">Standings</h3>
                      <LeagueTable table={calculateTable()} />
                    </div>
                  )}
                  <div className="league-content__actions">
                    <button
                      type="button"
                      className="btn-reset mode-btn"
                      onClick={() => setMatches([])}
                    >
                      Regenerate fixtures
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {mode === "knockout" && (
            <>
              {knockoutRounds.length === 0 ? (
                <div className="empty-state">
                  <h3>{teams.length} teams ready</h3>
                  <button type="button" className="btn-action" onClick={startKnockout}>
                    Start knockout cup
                  </button>
                </div>
              ) : (
                <>
                  <div className="bracket-scroll">
                    <div className="bracket-columns knockout-rounds">
                    {knockoutRounds.map((round, rIndex) => {
                      const isFinal =
                        knockoutRounds.length - 1 === rIndex &&
                        knockoutRounds.at(-1).length === 1;
                      const roundLabel = isFinal
                        ? "Final"
                        : rIndex === knockoutRounds.length - 2 && round.length === 2
                          ? "Semi-Final"
                          : `Round ${rIndex + 1}`;
                      return (
                      <div className="bracket-round panel-card knockout-round" key={rIndex}>
                        <h3 className="bracket-round__label">{roundLabel}</h3>
                        {round.map((m, mIndex) => (
                          <div
                            className={`knockout-match-card ${m.winner ? "knockout-match-card--won" : ""}`}
                            key={m.id}
                          >
                            <span className="knockout-match-num">
                              Match {mIndex + 1}
                            </span>
                            {m.teamB === "BYE" ? (
                              <p className="knockout-match-bye">
                                <span className="knockout-team-name is-winner">{m.teamA}</span>
                                <span className="vs-label">advances (bye)</span>
                              </p>
                            ) : (
                              <>
                                <div className="knockout-match-teams">
                                  <button
                                    type="button"
                                    className={`knockout-team-name ${
                                      m.winner === m.teamA ? "is-winner" : ""
                                    } ${m.winner && m.winner !== m.teamA ? "is-loser" : ""}`}
                                    onClick={() =>
                                      !m.winner && selectWinner(rIndex, m.id, m.teamA)
                                    }
                                    disabled={!!m.winner}
                                  >
                                    {m.teamA}
                                  </button>
                                  <span className="vs-label">vs</span>
                                  <button
                                    type="button"
                                    className={`knockout-team-name ${
                                      m.winner === m.teamB ? "is-winner" : ""
                                    } ${m.winner && m.winner !== m.teamB ? "is-loser" : ""}`}
                                    onClick={() =>
                                      !m.winner && selectWinner(rIndex, m.id, m.teamB)
                                    }
                                    disabled={!!m.winner}
                                  >
                                    {m.teamB}
                                  </button>
                                </div>
                                {m.winner && (
                                  <button
                                    type="button"
                                    className="btn-undo"
                                    onClick={() => undoWinner(rIndex, m.id)}
                                  >
                                    Undo
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                    })}
                    </div>
                  </div>
                  <div className="league-content__actions">
                    <button
                      type="button"
                      className="btn-reset mode-btn"
                      onClick={() => setKnockoutRounds([])}
                    >
                      Reset bracket
                    </button>
                  </div>
                </>
              )}
              {knockoutRounds.length > 0 &&
                knockoutRounds.at(-1).length === 1 &&
                knockoutRounds.at(-1)[0].winner && (
                  <h2 className="champion-banner">
                    Champion — {knockoutRounds.at(-1)[0].winner}
                  </h2>
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
        <button
          type="button"
          className={leagueTab === "standings" ? "is-active" : ""}
          onClick={() => setLeagueTab("standings")}
        >
          Table
        </button>
        <button type="button" onClick={takeScreenshot}>
          Export
        </button>
      </nav>
    </div>
  );
}
