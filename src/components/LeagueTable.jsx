export default function LeagueTable({ table }) {
  return (
    <div className="standings-wrapper">
      <table className="standings-table">
        <thead>
          <tr>
            <th>Team</th>
            <th>Played</th>
            <th>Win</th>
            <th>Draw</th>
            <th>Lose</th>
            <th className="points-col">Pts</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(table).map(([team, data]) => (
            <tr key={team}>
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
  );
}
