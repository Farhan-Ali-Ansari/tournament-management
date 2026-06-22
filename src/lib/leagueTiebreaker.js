import { calculateLeagueTable } from "./leagueTable";
import { getLeagueWinners, isLeagueFinished } from "./tournamentCompletion";

export const TIEBREAKER_MATCH_PREFIX = "tiebreaker:";

function isTiebreakerMatch(match) {
  return Boolean(match?.id?.startsWith(TIEBREAKER_MATCH_PREFIX));
}

export function splitMatches(allMatches) {
  const regularMatches = [];
  const tiebreakerMatches = [];
  for (const match of allMatches || []) {
    if (isTiebreakerMatch(match)) {
      tiebreakerMatches.push(match);
    } else {
      regularMatches.push(match);
    }
  }
  return { regularMatches, tiebreakerMatches };
}

export function removeTiebreakerMatches(allMatches) {
  return (allMatches || []).filter((m) => !isTiebreakerMatch(m));
}

function pairKey(teamA, teamB) {
  return [teamA, teamB].sort().join("|");
}

/** Round-robin fixtures between tied teams (appends only missing pairings). */
export function buildTiebreakerLeagueMatches(teamNames, existingTiebreakerMatches = []) {
  const names = [...new Set(teamNames)].filter(Boolean);
  if (names.length < 2) return [];

  const existingPairs = new Set(
    existingTiebreakerMatches.map((m) => pairKey(m.teamA, m.teamB))
  );

  const missing = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const key = pairKey(names[i], names[j]);
      if (!existingPairs.has(key)) {
        missing.push([names[i], names[j]]);
      }
    }
  }

  const pairings =
    missing.length > 0
      ? missing
      : names.flatMap((teamA, i) =>
          names.slice(i + 1).map((teamB) => [teamA, teamB])
        );

  const stamp = Date.now();
  return pairings.map(([teamA, teamB], index) => ({
    id: `${TIEBREAKER_MATCH_PREFIX}${stamp}-${index}`,
    teamA,
    teamB,
    scoreA: "",
    scoreB: "",
  }));
}

function getTiebreakerTeams(teamNames) {
  return teamNames.map((name, index) => ({ id: `tie-${index}`, name }));
}

export function getTiebreakerParticipantNames(tiebreakerMatches) {
  const names = new Set();
  for (const match of tiebreakerMatches || []) {
    if (match.teamA) names.add(match.teamA);
    if (match.teamB) names.add(match.teamB);
  }
  return [...names];
}

export function calculateTiebreakerTableFromMatches(tiebreakerMatches) {
  const names = getTiebreakerParticipantNames(tiebreakerMatches);
  if (!names.length) return {};
  return calculateLeagueTable(getTiebreakerTeams(names), tiebreakerMatches);
}

export function hasTiebreakerHistory(tiebreakerMatches) {
  return Array.isArray(tiebreakerMatches) && tiebreakerMatches.length > 0;
}

function calculateTiebreakerTable(tiedTeamNames, tiebreakerMatches) {
  return calculateLeagueTable(getTiebreakerTeams(tiedTeamNames), tiebreakerMatches);
}

export function getLeagueTiebreakerState({ table, tiebreakerMatches }) {
  const leaders = getLeagueWinners(table);
  if (leaders.length <= 1) {
    return { phase: "decided", champion: leaders[0] || null };
  }

  if (!tiebreakerMatches.length) {
    return {
      phase: "tiebreaker",
      tiedTeams: leaders,
      playoffStarted: false,
      needsNextRound: false,
    };
  }

  const tiebreakerTable = calculateTiebreakerTable(leaders, tiebreakerMatches);
  const contenders = Object.keys(tiebreakerTable);

  if (!isLeagueFinished(tiebreakerMatches)) {
    return {
      phase: "tiebreaker",
      tiedTeams: leaders,
      playoffStarted: true,
      needsNextRound: false,
      tiebreakerTable,
    };
  }

  const playoffLeaders = getLeagueWinners(tiebreakerTable);
  if (playoffLeaders.length === 1) {
    return {
      phase: "decided",
      champion: playoffLeaders[0],
      tiedTeams: leaders,
      hadPlayoff: true,
    };
  }

  const stillTied = playoffLeaders.filter((name) => contenders.includes(name));
  const nextContenders = stillTied.length >= 2 ? stillTied : playoffLeaders;

  return {
    phase: "tiebreaker",
    tiedTeams: nextContenders,
    playoffStarted: true,
    needsNextRound: true,
    tiebreakerTable,
  };
}
