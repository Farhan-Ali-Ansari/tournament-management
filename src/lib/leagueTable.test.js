import { calculateLeagueTable } from "./leagueTable";

describe("calculateLeagueTable", () => {
  const teams = [{ id: "1", name: "Alpha" }, { id: "2", name: "Beta" }];

  it("sorts by wins then fewer losses", () => {
    const matches = [
      { id: "1-2", teamA: "Alpha", teamB: "Beta", scoreA: "1", scoreB: "0" },
    ];
    const table = calculateLeagueTable(teams, matches);
    expect(Object.keys(table)[0]).toBe("Alpha");
    expect(table.Alpha.won).toBe(1);
    expect(table.Beta.lost).toBe(1);
  });

  it("ignores pending matches", () => {
    const matches = [
      { id: "1-2", teamA: "Alpha", teamB: "Beta", scoreA: "", scoreB: "" },
    ];
    const table = calculateLeagueTable(teams, matches);
    expect(table.Alpha.played).toBe(0);
  });
});
