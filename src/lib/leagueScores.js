/** League fixtures use binary scores: one side 1, the other 0. */
export function applyBinaryLeagueScore(match, side, value) {
  if (value !== "" && value !== "0" && value !== "1") {
    return match;
  }

  if (value === "") {
    return { ...match, scoreA: "", scoreB: "" };
  }

  const other = value === "0" ? "1" : "0";
  return side === "A"
    ? { ...match, scoreA: value, scoreB: other }
    : { ...match, scoreB: value, scoreA: other };
}
