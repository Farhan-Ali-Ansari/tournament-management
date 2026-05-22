export default function LeagueTable({ table }) {
  const entries = Object.entries(table);

  return (
    <div className="standings-board" role="table" aria-label="League standings">
      <div className="standings-board__head" role="row">
        <span className="standings-board__col standings-board__col--team" role="columnheader">
          Team
        </span>
        <span className="standings-board__col standings-board__col--num" role="columnheader">
          Win
        </span>
        <span className="standings-board__col standings-board__col--num" role="columnheader">
          Lose
        </span>
      </div>
      <ul className="standings-board__body" role="rowgroup">
        {entries.map(([team, data]) => (
          <li key={team} className="standings-board__row" role="row">
            <span className="standings-board__col standings-board__col--team" role="cell">
              {team}
            </span>
            <span className="standings-board__col standings-board__col--num" role="cell">
              {data.won}
            </span>
            <span className="standings-board__col standings-board__col--num" role="cell">
              {data.lost}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
