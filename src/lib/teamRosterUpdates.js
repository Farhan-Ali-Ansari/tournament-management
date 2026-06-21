import { removeTeamFromKnockout } from "./knockoutBracket";
import { MODES } from "./tournamentModes";

export function removeTeamFromLeagueMatches(matches, teamName) {
  return matches.filter((m) => m.teamA !== teamName && m.teamB !== teamName);
}

/** New league fixtures for a team added at the end of the roster (standard league only). */
export function addLeagueFixturesForTeam(teams, newTeam, existingMatches) {
  const newTeamIndex = teams.findIndex((t) => t.id === newTeam.id);
  if (newTeamIndex <= 0) return [];

  const fixtures = [];
  for (let i = 0; i < newTeamIndex; i++) {
    const other = teams[i];
    const id = `${other.id}-${newTeam.id}`;
    if (existingMatches.some((m) => m.id === id)) continue;
    fixtures.push({
      id,
      teamA: other.name,
      teamB: newTeam.name,
      scoreA: "",
      scoreB: "",
    });
  }
  return fixtures;
}

export function applyTeamRemovalToMatchData({
  teamName,
  mode,
  setMatches,
  setKnockoutRounds,
  setDraftLeagueMatches,
  setDraftKnockoutPairings,
}) {
  if (mode === MODES.LEAGUE || mode === MODES.CUSTOM_LEAGUE) {
    setMatches((prev) => removeTeamFromLeagueMatches(prev, teamName));
    setDraftLeagueMatches((prev) => removeTeamFromLeagueMatches(prev, teamName));
  } else if (mode === MODES.KNOCKOUT || mode === MODES.CUSTOM_KNOCKOUT) {
    setKnockoutRounds((prev) => removeTeamFromKnockout(prev, teamName));
    setDraftKnockoutPairings((prev) =>
      prev.filter((p) => p.teamA !== teamName && p.teamB !== teamName)
    );
  }
}

export function applyTeamAdditionToMatchData({
  teams,
  newTeam,
  mode,
  isStarted,
  setMatches,
}) {
  if (!isStarted || mode !== MODES.LEAGUE) return;
  setMatches((prev) => [...prev, ...addLeagueFixturesForTeam(teams, newTeam, prev)]);
}
