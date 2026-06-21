import { useMemo, useState } from "react";

function matchIncludesTeam(match, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return match.teamA.toLowerCase().includes(q) || match.teamB.toLowerCase().includes(q);
}

export default function LeagueMatches({ matches, onScoreChange, readOnly = false }) {
  const [search, setSearch] = useState("");

  const visibleMatches = useMemo(
    () => matches.filter((match) => matchIncludesTeam(match, search)),
    [matches, search]
  );

  return (
    <div className="league-fixtures">
      <div className="fixture-search">
        <label className="fixture-search__label" htmlFor="fixture-team-search">
          Search teams
        </label>
        <input
          id="fixture-team-search"
          type="search"
          className="team-form__input fixture-search__input"
          placeholder="Type a team name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>
      {visibleMatches.length === 0 ? (
        <p className="fixture-search__empty">No fixtures match “{search.trim()}”.</p>
      ) : (
        visibleMatches.map((match) => {
          const matchIndex = matches.findIndex((m) => m.id === match.id);
          return (
        <div key={match.id} className="match-vs-card">
          <div className="match-vs-card__header">Match {matchIndex + 1}</div>
          <div className="match-vs-card__teams">
            <span className="match-vs-card__team">{match.teamA}</span>
            <span className="match-vs-card__divider">VS</span>
            <span className="match-vs-card__team">{match.teamB}</span>
          </div>
          <div className="match-vs-card__scores fixture-scores">
            {readOnly ? (
              <>
                <span className="fixture-score-display">
                  {match.scoreA === "" ? "—" : match.scoreA}
                </span>
                <span className="fixture-score-sep">–</span>
                <span className="fixture-score-display">
                  {match.scoreB === "" ? "—" : match.scoreB}
                </span>
              </>
            ) : (
              <>
            <input
              className="fixture-score-input"
              type="number"
              min="0"
              inputMode="numeric"
              value={match.scoreA}
              onChange={(e) => onScoreChange(match.id, "A", e.target.value)}
              aria-label={`${match.teamA} score`}
            />
            <span className="fixture-score-sep">–</span>
            <input
              className="fixture-score-input"
              type="number"
              min="0"
              inputMode="numeric"
              value={match.scoreB}
              onChange={(e) => onScoreChange(match.id, "B", e.target.value)}
              aria-label={`${match.teamB} score`}
            />
              </>
            )}
          </div>
        </div>
          );
        })
      )}
    </div>
  );
}
