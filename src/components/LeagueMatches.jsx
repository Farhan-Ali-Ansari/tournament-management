import { useMemo, useState } from "react";

function matchIncludesTeam(match, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return match.teamA.toLowerCase().includes(q) || match.teamB.toLowerCase().includes(q);
}

export default function LeagueMatches({
  matches,
  onScoreChange,
  readOnly = false,
  searchInputId = "fixture-team-search",
}) {
  const [search, setSearch] = useState("");

  const visibleMatches = useMemo(
    () => matches.filter((match) => matchIncludesTeam(match, search)),
    [matches, search]
  );

  return (
    <div className="league-fixtures">
      <div className="fixture-search" data-export-hide>
        <label className="fixture-search__label" htmlFor={searchInputId}>
          Search teams
        </label>
        <input
          id={searchInputId}
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
              type="text"
              inputMode="numeric"
              pattern="[01]"
              maxLength={1}
              placeholder="—"
              value={match.scoreA}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || v === "0" || v === "1") {
                  onScoreChange(match.id, "A", v);
                }
              }}
              aria-label={`${match.teamA} score (0 or 1)`}
              title="Enter 0 or 1 — the other team updates automatically"
            />
            <span className="fixture-score-sep">–</span>
            <input
              className="fixture-score-input"
              type="text"
              inputMode="numeric"
              pattern="[01]"
              maxLength={1}
              placeholder="—"
              value={match.scoreB}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || v === "0" || v === "1") {
                  onScoreChange(match.id, "B", v);
                }
              }}
              aria-label={`${match.teamB} score (0 or 1)`}
              title="Enter 0 or 1 — the other team updates automatically"
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
