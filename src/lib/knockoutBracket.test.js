import { buildFullBracket, getChampion } from "./knockoutBracket";

describe("knockoutBracket", () => {
  it("builds bracket for four teams", () => {
    const teams = [
      { id: "1", name: "A" },
      { id: "2", name: "B" },
      { id: "3", name: "C" },
      { id: "4", name: "D" },
    ];
    const rounds = buildFullBracket(teams);
    expect(rounds.length).toBeGreaterThan(0);
    expect(rounds[0].length).toBe(2);
  });

  it("returns champion from final round", () => {
    const rounds = [
      [{ id: "f", teamA: "Winner", teamB: "Loser", winner: "Winner" }],
    ];
    expect(getChampion(rounds)).toBe("Winner");
  });
});
