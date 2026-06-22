import {
  buildTiebreakerLeagueMatches,
  splitMatches,
  TIEBREAKER_MATCH_PREFIX,
} from "./leagueTiebreaker";
import { getTournamentFinishInfo } from "./tournamentCompletion";
import { MODES } from "./tournamentModes";

describe("league tiebreaker", () => {
  const tiedTable = {
    Alpha: { played: 2, won: 1, lost: 1, draw: 0, points: 3 },
    Beta: { played: 2, won: 1, lost: 1, draw: 0, points: 3 },
  };

  const finishedMatches = [
    { id: "1", teamA: "Alpha", teamB: "Beta", scoreA: "1", scoreB: "0" },
    { id: "2", teamA: "Alpha", teamB: "Beta", scoreA: "0", scoreB: "1" },
  ];

  it("splits regular and tiebreaker fixtures", () => {
    const all = [
      { id: "1-2", teamA: "A", teamB: "B" },
      { id: `${TIEBREAKER_MATCH_PREFIX}a-b`, teamA: "A", teamB: "B" },
    ];
    const { regularMatches, tiebreakerMatches } = splitMatches(all);
    expect(regularMatches).toHaveLength(1);
    expect(tiebreakerMatches).toHaveLength(1);
  });

  it("builds round-robin tiebreaker fixtures", () => {
    const fixtures = buildTiebreakerLeagueMatches(["Alpha", "Beta", "Gamma"]);
    expect(fixtures).toHaveLength(3);
    expect(fixtures.every((m) => m.id.startsWith(TIEBREAKER_MATCH_PREFIX))).toBe(true);
  });

  it("requires tiebreaker when leaders are tied", () => {
    const info = getTournamentFinishInfo({
      mode: MODES.LEAGUE,
      matches: finishedMatches,
      knockoutRounds: [],
      table: tiedTable,
    });
    expect(info.finished).toBe(false);
    expect(info.needsTiebreaker).toBe(true);
    expect(info.tiedTeams).toEqual(["Alpha", "Beta"]);
  });

  it("finishes with one champion after tiebreaker league", () => {
    const tiebreaker = buildTiebreakerLeagueMatches(["Alpha", "Beta"]).map((m) => ({
      ...m,
      scoreA: "1",
      scoreB: "0",
    }));

    const info = getTournamentFinishInfo({
      mode: MODES.LEAGUE,
      matches: [...finishedMatches, ...tiebreaker],
      knockoutRounds: [],
      table: tiedTable,
    });
    expect(info.finished).toBe(true);
    expect(info.winners).toEqual(["Alpha"]);
    expect(info.hadTiebreaker).toBe(true);
    expect(info.tiebreakerTable).toBeDefined();
    expect(Object.keys(info.tiebreakerTable).length).toBeGreaterThan(0);
  });

  it("keeps tiebreaker history visible after tournament finishes", () => {
    const tiebreaker = buildTiebreakerLeagueMatches(["Alpha", "Beta"]).map((m) => ({
      ...m,
      scoreA: "1",
      scoreB: "0",
    }));

    const info = getTournamentFinishInfo({
      mode: MODES.LEAGUE,
      matches: [...finishedMatches, ...tiebreaker],
      knockoutRounds: [],
      table: tiedTable,
    });

    expect(info.finished).toBe(true);
    expect(info.tiebreakerStarted).toBe(true);
    expect(info.needsTiebreaker).toBeUndefined();
    expect(info.tiedTeams).toEqual(["Alpha", "Beta"]);
  });
});
