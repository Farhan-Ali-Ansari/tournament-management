import { stripFormatMeta, getFormatMeta, resolveAppMode } from "./tournamentPersistence";
import { MODES } from "./tournamentModes";

describe("tournamentPersistence", () => {
  it("strips format meta from matches", () => {
    const matches = [
      { id: "__format_meta__", variant: MODES.CUSTOM_LEAGUE },
      { id: "a-b", teamA: "A", teamB: "B" },
    ];
    expect(stripFormatMeta(matches)).toHaveLength(1);
    expect(getFormatMeta(matches)?.variant).toBe(MODES.CUSTOM_LEAGUE);
  });

  it("resolves custom league from meta", () => {
    const row = {
      mode: "league",
      matches: [{ id: "__format_meta__", variant: MODES.CUSTOM_LEAGUE }],
    };
    expect(resolveAppMode(row)).toBe(MODES.CUSTOM_LEAGUE);
  });
});
