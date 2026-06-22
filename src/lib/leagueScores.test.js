import { applyBinaryLeagueScore } from "./leagueScores";

describe("applyBinaryLeagueScore", () => {
  const match = { id: "1", teamA: "A", teamB: "B", scoreA: "", scoreB: "" };

  it("sets opposite score when entering 1", () => {
    expect(applyBinaryLeagueScore(match, "A", "1")).toEqual({
      ...match,
      scoreA: "1",
      scoreB: "0",
    });
  });

  it("sets opposite score when entering 0", () => {
    expect(applyBinaryLeagueScore(match, "B", "0")).toEqual({
      ...match,
      scoreA: "1",
      scoreB: "0",
    });
  });

  it("clears both scores when empty", () => {
    const played = { ...match, scoreA: "1", scoreB: "0" };
    expect(applyBinaryLeagueScore(played, "A", "")).toEqual({
      ...played,
      scoreA: "",
      scoreB: "",
    });
  });

  it("ignores invalid values", () => {
    expect(applyBinaryLeagueScore(match, "A", "2")).toBe(match);
  });
});
