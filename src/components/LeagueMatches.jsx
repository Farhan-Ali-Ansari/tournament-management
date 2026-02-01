export default function LeagueMatches({ matches, onScoreChange }) {
  return (
    <div className="league-fixtures">
      {matches.map((match, index) => (
        <div key={match.id} className="league-fixture-row">
          <span className="fixture-num">Match {index + 1}</span>
          <span className="fixture-team fixture-team--a">{match.teamA}</span>
          <div className="fixture-scores">
            <input
              className="fixture-score-input"
              type="number"
              min="0"
              value={match.scoreA}
              onChange={(e) => onScoreChange(match.id, "A", e.target.value)}
              aria-label={`${match.teamA} score`}
            />
            <span className="fixture-score-sep">–</span>
            <input
              className="fixture-score-input"
              type="number"
              min="0"
              value={match.scoreB}
              onChange={(e) => onScoreChange(match.id, "B", e.target.value)}
              aria-label={`${match.teamB} score`}
            />
          </div>
          <span className="fixture-team fixture-team--b">{match.teamB}</span>
        </div>
      ))}
    </div>
  );
}
