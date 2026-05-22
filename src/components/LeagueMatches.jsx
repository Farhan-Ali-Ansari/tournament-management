export default function LeagueMatches({ matches, onScoreChange }) {
  return (
    <div className="league-fixtures">
      {matches.map((match, index) => (
        <div key={match.id} className="match-vs-card">
          <div className="match-vs-card__header">Match {index + 1}</div>
          <div className="match-vs-card__teams">
            <span className="match-vs-card__team">{match.teamA}</span>
            <span className="match-vs-card__divider">VS</span>
            <span className="match-vs-card__team">{match.teamB}</span>
          </div>
          <div className="match-vs-card__scores fixture-scores">
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
          </div>
        </div>
      ))}
    </div>
  );
}
