import { useEffect, useState } from "react";
import TeamForm from "./components/TeamForm";
import TeamList from "./components/TeamList";
import LeagueMatches from "./components/LeagueMatches";
import LeagueTable from "./components/LeagueTable";
import "./App.css";

export default function App() {
  // Options: 'welcome', 'teams', 'select', 'game'
  const [view, setView] = useState("welcome");

  // ===== DATA STATES =====
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

  // ===== LOGIC: TEAMS =====
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

  // ===== LOGIC: LEAGUE =====
  const generateLeagueMatches = (currentTeams) => {
    if(currentTeams.length < 2) return alert("Need at least 2 teams!");
    if(matches.length > 0 && !window.confirm("This will overwrite current scores. Continue?")) return;
    
    const list = [];
    for (let i = 0; i < currentTeams.length; i++) {
      for (let j = i + 1; j < currentTeams.length; j++) {
        list.push({ id: `${currentTeams[i].id}-${currentTeams[j].id}`, teamA: currentTeams[i].name, teamB: currentTeams[j].name, scoreA: "", scoreB: "" });
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
      
      // Safety check if team was deleted but match exists
      if(!table[m.teamA] || !table[m.teamB]) return;

      table[m.teamA].played++; table[m.teamB].played++;

      if (a > b) { table[m.teamA].won++; table[m.teamA].points += 3; table[m.teamB].lost++; }
      else if (a < b) { table[m.teamB].won++; table[m.teamB].points += 3; table[m.teamA].lost++; }
      else { table[m.teamA].draw++; table[m.teamB].draw++; table[m.teamA].points++; table[m.teamB].points++; }
    });

    return Object.entries(table)
      .sort(([, a], [, b]) => b.points - a.points || b.won - a.won)
      .reduce((obj, [key, value]) => { obj[key] = value; return obj; }, {});
  };

  // ===== LOGIC: KNOCKOUT =====
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
      
      const roundComplete = updated[roundIndex].every(m => m.winner);
      
      if (roundComplete && updated.length === roundIndex + 1) {
        const winners = updated[roundIndex].map(m => ({ name: m.winner }));
        if (winners.length > 1) {
          updated.push(generateKnockoutMatches(winners));
        }
      }
      return updated;
    });
  };

  const resetTournament = () => {
    if(!window.confirm("Are you sure? This will delete all data.")) return;
    setTeams([]);
    setMatches([]);
    setKnockoutRounds([]);
    localStorage.clear();
    setView("teams"); // Go back to team selection on reset
  };

  // ===== NAVIGATION =====
  const goNextToSelection = () => {
    if (teams.length < 2) return alert("Please add at least 2 teams.");
    setView("select");
  };

  const enterGame = (selectedMode) => {
    setMode(selectedMode);
    setView("game");
  };

  // ===== RENDER 1: WELCOME =====
  if (view === "welcome") {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <h1 className="splash-title">Jackaroo Tournament Manager</h1>
          <h3 className="splash-subtitle">Made by Farhan</h3>
          <button className="btn-primary-large" onClick={() => setView('teams')}>
            Start
          </button>
        </div>
      </div>
    );
  }

  // ===== RENDER 2: TEAMS (NEW STEP) =====
  if (view === "teams") {
    return (
      <div className="splash-screen">
        <div className="wizard-card">
          <h2 className="section-title" style={{textAlign:'center', fontSize: '1.2rem'}}>Step 1: Add Teams</h2>
          <TeamForm onAddTeam={addTeam} />
          <div className="wizard-list-area">
             <TeamList teams={teams} onDelete={deleteTeam} />
          </div>
          <div className="wizard-footer">
             <button className="btn-text" onClick={() => setView('welcome')}>Back</button>
             <button 
               className="btn-primary-large" 
               style={{padding: '0.8rem 2rem', fontSize: '1rem', opacity: teams.length < 2 ? 0.5 : 1}}
               onClick={goNextToSelection}
             >
               Next: Select Mode →
             </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== RENDER 3: SELECTION =====
  if (view === "select") {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <h2 className="splash-title">Step 2: Game Mode</h2>
          <div className="selection-buttons">
            <button className="btn-card" onClick={() => enterGame("league")}>
              🏆<br/>League
            </button>
            <button className="btn-card" onClick={() => enterGame("knockout")}>
              🥊<br/>Knockout
            </button>
          </div>
          <button className="btn-text" onClick={() => setView('teams')}>← Back to Teams</button>
        </div>
      </div>
    );
  }

  // ===== RENDER 4: GAME =====
  return (
    <div className="tournament-app">
      <header className="app-header">
        <div className="app-header__inner">
          <div className="header-top">
             <button onClick={() => setView('select')} className="btn-back">← Menu</button>
             <h1 className="app-title">
               {mode === 'league' ? 'League Manager' : 'Knockout Manager'}
             </h1>
          </div>
        </div>
      </header>

      <div className="content-grid">
        {/* Sidebar now strictly for edits or reset */}
        <aside className="sidebar-panel">
          <div className="panel-card">
            <h3 className="section-title">Quick Edit Teams</h3>
            <TeamForm onAddTeam={addTeam} />
            <TeamList teams={teams} onDelete={deleteTeam} />
            <div style={{marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem'}}>
               <button type="button" className="btn-reset mode-btn" style={{width:'100%'}} onClick={resetTournament}>
                Reset Everything
              </button>
            </div>
          </div>
        </aside>

        <main className="main-panel">
          {mode === "league" && (
            <>
              {matches.length === 0 ? (
                <div className="empty-state">
                  <h3>{teams.length} Teams Ready</h3>
                  <button type="button" className="btn-action" onClick={() => generateLeagueMatches(teams)}>
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
                    <button type="button" className="btn-reset mode-btn" onClick={() => setMatches([])}>
                      Regenerate Fixtures
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {mode === "knockout" && (
            <>
              {knockoutRounds.length === 0 && (
                <div className="empty-state">
                  <h3>{teams.length} Teams Ready</h3>
                  <button type="button" className="btn-action" onClick={startKnockout}>
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
                                <button type="button" className="mode-btn btn-team-a" onClick={() => selectWinner(rIndex, m.id, m.teamA)}>
                                  {m.teamA}
                                </button>
                                <button type="button" className="mode-btn btn-team-b" onClick={() => selectWinner(rIndex, m.id, m.teamB)}>
                                  {m.teamB}
                                </button>
                              </div>
                            )}
                            {m.winner && <strong className="knockout-winner-text">Winner: {m.winner}</strong>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="league-content__actions">
                    <button type="button" className="btn-reset mode-btn" onClick={() => setKnockoutRounds([])}>
                      Reset Knockout
                    </button>
                  </div>
                </>
              )}
              {knockoutRounds.length > 0 && knockoutRounds.at(-1).length === 1 && knockoutRounds.at(-1)[0].winner && (
                <h2 className="champion-banner">🏆 {knockoutRounds.at(-1)[0].winner} 🏆</h2>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}