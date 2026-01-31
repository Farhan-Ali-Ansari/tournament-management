import { useEffect, useState } from "react";
import TeamForm from "./components/TeamForm";
import TeamList from "./components/TeamList";
import LeagueMatches from "./components/LeagueMatches";
import LeagueTable from "./components/LeagueTable";
import "./App.css";

export default function App() {
  // ===== STATES =====
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem("teams");
    return saved ? JSON.parse(saved) : [];
  });

  const [mode, setMode] = useState(() => localStorage.getItem("mode") || "league");

  const [matches, setMatches] = useState(() => {
    const saved = localStorage.getItem("matches");
    return saved ? JSON.parse(saved) : [];
  });

  const [knockoutRounds, setKnockoutRounds] = useState(() => {
    const saved = localStorage.getItem("knockoutRounds");
    return saved ? JSON.parse(saved) : [];
  });

  // ===== LOCAL STORAGE =====
  useEffect(() => { localStorage.setItem("teams", JSON.stringify(teams)); }, [teams]);
  useEffect(() => { localStorage.setItem("mode", mode); }, [mode]);
  useEffect(() => { localStorage.setItem("matches", JSON.stringify(matches)); }, [matches]);
  useEffect(() => { localStorage.setItem("knockoutRounds", JSON.stringify(knockoutRounds)); }, [knockoutRounds]);

  // ===== TEAM LOGIC =====
  const addTeam = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return alert("Team name cannot be empty!");
    if (teams.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) return alert("Team already exists!");
    setTeams(prev => [...prev, { id: Date.now(), name: trimmed }]);
  };

  const deleteTeam = (id) => {
    if(!window.confirm("Delete this team? It will reset matches.")) return;
    setTeams(prev => prev.filter(t => t.id !== id));
    setMatches([]);
    setKnockoutRounds([]);
  };

  // ===== LEAGUE LOGIC =====
  const generateLeagueMatches = (teams) => {
    if(teams.length < 2) return alert("Need at least 2 teams!");
    if(!window.confirm("This will overwrite current scores. Continue?")) return;
    
    const list = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        list.push({ id: `${teams[i].id}-${teams[j].id}`, teamA: teams[i].name, teamB: teams[j].name, scoreA: "", scoreB: "" });
      }
    }
    setMatches(list);
  };

  const handleScoreChange = (id, team, value) => {
    setMatches(prev =>
      prev.map(m =>
        m.id === id
          ? { ...m, scoreA: team === "A" ? value : m.scoreA, scoreB: team === "B" ? value : m.scoreB }
          : m
      )
    );
  };

  const calculateTable = () => {
    const table = {};
    teams.forEach(t => table[t.name] = { played: 0, won: 0, draw: 0, lost: 0, points: 0 });

    matches.forEach(m => {
      if (m.scoreA === "" || m.scoreB === "") return;
      const a = Number(m.scoreA), b = Number(m.scoreB);

      table[m.teamA].played++; table[m.teamB].played++;

      if (a > b) { table[m.teamA].won++; table[m.teamA].points += 3; table[m.teamB].lost++; }
      else if (a < b) { table[m.teamB].won++; table[m.teamB].points += 3; table[m.teamA].lost++; }
      else { table[m.teamA].draw++; table[m.teamB].draw++; table[m.teamA].points++; table[m.teamB].points++; }
    });

    const sorted = Object.entries(table)
      .sort(([, a], [, b]) => b.points - a.points || b.won - a.won) // Sort by points then wins
      .reduce((obj, [key, value]) => { obj[key] = value; return obj; }, {});

    return sorted;
  };

  // ===== KNOCKOUT LOGIC =====
  const generateKnockoutMatches = (currentTeams) => {
    const shuffled = [...currentTeams].sort(() => Math.random() - 0.5);
    const round = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) round.push({ id: `${shuffled[i].name}-${shuffled[i + 1].name}`, teamA: shuffled[i].name, teamB: shuffled[i + 1].name, winner: "" });
      else round.push({ id: `${shuffled[i].name}-bye`, teamA: shuffled[i].name, teamB: "BYE", winner: shuffled[i].name });
    }
    return round;
  };

  const startKnockout = () => { 
    if (teams.length < 2) return alert("Need at least 2 teams!");
    setKnockoutRounds([generateKnockoutMatches(teams)]); 
  };
  
  const selectWinner = (roundIndex, matchId, winner) => {
    setKnockoutRounds(prev => {
      const updated = [...prev];
      updated[roundIndex] = updated[roundIndex].map(m => m.id === matchId ? { ...m, winner } : m);
      
      // Check if round is complete
      const roundComplete = updated[roundIndex].every(m => m.winner);
      
      // If round complete and we haven't already generated the next round
      if (roundComplete && updated.length === roundIndex + 1) {
        const winners = updated[roundIndex].map(m => ({ name: m.winner }));
        if (winners.length > 1) {
          updated.push(generateKnockoutMatches(winners));
        }
      }
      return updated;
    });
  };

  // ===== RESET TOURNAMENT =====
  const resetTournament = () => {
    if(!window.confirm("Are you sure? This will delete all data.")) return;
    setTeams([]);
    setMatches([]);
    setKnockoutRounds([]);
    setMode("league");
    localStorage.clear();
  };

  // ===== UI =====
  return (
    <div className="tournament-app">
      <header className="app-header">
        <div className="app-header__inner">
          <h1 className="app-title">🏆 Tournament Manager</h1>
          <div className="mode-switcher">
            <button
              type="button"
              className={`mode-btn ${mode === "league" ? "mode-btn--active" : ""}`}
              onClick={() => setMode("league")}
            >
              League
            </button>
            <button
              type="button"
              className={`mode-btn ${mode === "knockout" ? "mode-btn--active" : ""}`}
              onClick={() => setMode("knockout")}
            >
              Knockout
            </button>
            <button type="button" className="mode-btn btn-reset" onClick={resetTournament}>
              Reset All
            </button>
          </div>
        </div>
      </header>

      <div className="content-grid">
        <aside className="sidebar-panel">
          <div className="panel-card">
            <h3 className="section-title">Manage Teams</h3>
            <TeamForm onAddTeam={addTeam} />
            <TeamList teams={teams} onDelete={deleteTeam} />
          </div>
        </aside>

        <main className="main-panel">
          {/* League Mode */}
          {mode === "league" && (
            <>
              {matches.length === 0 ? (
                <div className="empty-state">
                  <button
                    type="button"
                    className="btn-action"
                    onClick={() => generateLeagueMatches(teams)}
                  >
                    Start League Season
                  </button>
                </div>
              ) : (
                <div className="league-content">
                  <div className="league-content__grid">
                    <div className="panel-card panel-card--fixtures">
                      <h3 className="section-title">Match Fixtures</h3>
                      <LeagueMatches matches={matches} onScoreChange={handleScoreChange} />
                    </div>
                    <div className="panel-card panel-card--standings">
                      <h3 className="section-title">Standings</h3>
                      <LeagueTable table={calculateTable()} />
                    </div>
                  </div>
                  <div className="league-content__actions">
                    <button
                      type="button"
                      className="btn-reset mode-btn"
                      onClick={() => setMatches([])}
                    >
                      Regenerate Fixtures
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Knockout Mode */}
          {mode === "knockout" && (
            <>
              {knockoutRounds.length === 0 && (
                <div className="empty-state">
                  <button
                    type="button"
                    className="btn-action"
                    onClick={startKnockout}
                  >
                    Start Knockout Cup
                  </button>
                </div>
              )}

              {knockoutRounds.length > 0 && (
                <>
              <div className="knockout-rounds">
              {knockoutRounds.map((round, rIndex) => (
                <div className="panel-card knockout-round" key={rIndex}>
                  <h3 className="section-title">
                    {knockoutRounds.length - 1 === rIndex && knockoutRounds.at(-1).length === 1
                      ? "Finals"
                      : `Round ${rIndex + 1}`}
                  </h3>
                  {round.map((m) => (
                    <div className="knockout-match-card" key={m.id}>
                      <span className="knockout-match-teams">
                        {m.teamA} <span className="vs-label">VS</span> {m.teamB}
                      </span>

                      {!m.winner && m.teamB !== "BYE" && (
                        <div className="knockout-winner-btns">
                          <button
                            type="button"
                            className="mode-btn btn-team-a"
                            onClick={() => selectWinner(rIndex, m.id, m.teamA)}
                          >
                            {m.teamA} Win
                          </button>
                          <button
                            type="button"
                            className="mode-btn btn-team-b"
                            onClick={() => selectWinner(rIndex, m.id, m.teamB)}
                          >
                            {m.teamB} Win
                          </button>
                        </div>
                      )}

                      {m.winner && (
                        <strong className="knockout-winner-text">Winner: {m.winner}</strong>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              </div>

              <div className="league-content__actions">
                <button
                  type="button"
                  className="btn-reset mode-btn"
                  onClick={() => setKnockoutRounds([])}
                >
                  Regenerate Fixtures
                </button>
              </div>
                </>
              )}

              {knockoutRounds.length > 0 &&
                knockoutRounds.at(-1).length === 1 &&
                knockoutRounds.at(-1)[0].winner && (
                  <h2 className="champion-banner">
                    🏆 {knockoutRounds.at(-1)[0].winner} 🏆
                  </h2>
                )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}