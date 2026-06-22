import { getTournamentFinishInfo, getTournamentCardStatus, isLeagueFinished } from "./tournamentCompletion";
import { MODES } from "./tournamentModes";

describe("tournamentCompletion", () => {
  it("detects league completion", () => {
    const matches = [
      { scoreA: "1", scoreB: "0" },
      { scoreA: "", scoreB: "" },
    ];
    expect(isLeagueFinished(matches)).toBe(false);
    expect(isLeagueFinished([{ scoreA: "1", scoreB: "0" }])).toBe(true);
  });

  it("returns league winner when finished", () => {
    const info = getTournamentFinishInfo({
      mode: MODES.LEAGUE,
      matches: [{ id: "1", teamA: "A", teamB: "B", scoreA: "1", scoreB: "0" }],
      knockoutRounds: [],
      table: {
        A: { played: 1, won: 1, lost: 0, draw: 0, points: 3 },
        B: { played: 1, won: 0, lost: 1, draw: 0, points: 0 },
      },
    });
    expect(info.finished).toBe(true);
    expect(info.winners).toEqual(["A"]);
  });

  it("returns finished card status when league is done", () => {
    const status = getTournamentCardStatus({
      mode: "league",
      teams: [{ id: "1", name: "A" }, { id: "2", name: "B" }],
      matches: [{ id: "1-2", teamA: "A", teamB: "B", scoreA: "1", scoreB: "0" }],
      knockout_rounds: [],
    });
    expect(status).toBe("finished");
  });
});
