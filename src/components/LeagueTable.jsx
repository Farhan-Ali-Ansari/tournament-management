export default function LeagueTable({ table, onViewDetails }) {
  const entries = Object.entries(table);

  return (
    <div className="standings-board" role="table" aria-label="League standings">
      <div className="standings-board__head" role="row">
        <span className="standings-board__col standings-board__col--team" role="columnheader">
          Team
        </span>
        <div className="standings-board__metrics-head" role="presentation">
          <span className="standings-board__col standings-board__col--num" role="columnheader">
            Played
          </span>
          <span className="standings-board__col standings-board__col--num" role="columnheader">
            Won
          </span>
          <span className="standings-board__col standings-board__col--num" role="columnheader">
            Lost
          </span>
        </div>
        <span className="standings-board__col standings-board__col--action" role="columnheader">
          Details
        </span>
      </div>
      <ul className="standings-board__body" role="rowgroup">
        {entries.map(([team, data]) => (
          <li key={team} className="standings-board__row" role="row">
            <span className="standings-board__col standings-board__col--team" role="cell" title={team}>
              {team}
            </span>
            <div className="standings-board__metrics" role="group" aria-label={`${team} stats`}>
              <div className="standings-board__metric">
                <span className="standings-board__metric-label">Played</span>
                <span className="standings-board__metric-value">{data.played}</span>
              </div>
              <div className="standings-board__metric">
                <span className="standings-board__metric-label">Won</span>
                <span className="standings-board__metric-value">{data.won}</span>
              </div>
              <div className="standings-board__metric">
                <span className="standings-board__metric-label">Lost</span>
                <span className="standings-board__metric-value">{data.lost}</span>
              </div>
            </div>
            <span className="standings-board__col standings-board__col--action" role="cell">
              <button
                type="button"
                className="standings-details-btn"
                onClick={() => onViewDetails?.(team)}
              >
                View
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
