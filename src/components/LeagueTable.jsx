function Podium({ entries }) {
  if (entries.length === 0) return null;

  const order = [1, 0, 2];
  const medals = ["🥈", "🥇", "🥉"];
  const labels = ["2nd", "1st", "3rd"];

  return (
    <div className="standings-podium" aria-label="Top three teams">
      {order.map((idx) => {
        const entry = entries[idx];
        if (!entry) return <div key={idx} className="podium-card" style={{ visibility: "hidden" }} />;
        const [team, data] = entry;
        return (
          <div
            key={team}
            className={`podium-card podium-card--${idx + 1}`}
          >
            <span className="podium-card__medal">{medals[idx]}</span>
            <span className="podium-card__rank">{labels[idx]}</span>
            <span className="podium-card__name">{team}</span>
            <span className="podium-card__pts">{data.points} pts</span>
          </div>
        );
      })}
    </div>
  );
}

export default function LeagueTable({ table }) {
  const entries = Object.entries(table);
  const topThree = entries.slice(0, 3);

  return (
    <>
      {topThree.length > 0 && <Podium entries={topThree} />}

      <div className="standings-wrapper">
        <table className="standings-table data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>Played</th>
              <th>Win</th>
              <th>Draw</th>
              <th>Lose</th>
              <th className="points-col">Pts</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([team, data], index) => (
              <tr key={team}>
                <td>
                  {index + 1}
                  {index === 0 && (
                    <span className="rank-delta rank-delta--up" aria-label="Leader">
                      ▲
                    </span>
                  )}
                </td>
                <td>{team}</td>
                <td>{data.played}</td>
                <td>{data.won}</td>
                <td>{data.draw}</td>
                <td>{data.lost}</td>
                <td className="points-col">{data.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}
