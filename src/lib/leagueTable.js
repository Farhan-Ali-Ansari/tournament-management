/** Build sorted league standings from teams and scored matches. */
export function calculateLeagueTable(teams, matches) {
  const table = {};
  teams.forEach((t) => {
    table[t.name] = { played: 0, won: 0, draw: 0, lost: 0, points: 0 };
  });
  matches.forEach((m) => {
    if (m.scoreA === "" || m.scoreB === "") return;
    const a = Number(m.scoreA);
    const b = Number(m.scoreB);
    if (!table[m.teamA] || !table[m.teamB]) return;
    table[m.teamA].played++;
    table[m.teamB].played++;
    if (a > b) {
      table[m.teamA].won++;
      table[m.teamA].points += 3;
      table[m.teamB].lost++;
    } else if (a < b) {
      table[m.teamB].won++;
      table[m.teamB].points += 3;
      table[m.teamA].lost++;
    } else {
      table[m.teamA].draw++;
      table[m.teamB].draw++;
      table[m.teamA].points++;
      table[m.teamB].points++;
    }
  });
  return Object.entries(table)
    .sort(([, a], [, b]) => b.won - a.won || a.lost - b.lost || b.played - a.played)
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
}
