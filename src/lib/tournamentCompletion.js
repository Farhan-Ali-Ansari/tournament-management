import { getChampion } from "./knockoutBracket";
import { calculateLeagueTable } from "./leagueTable";
import { decodeFromDatabase } from "./tournamentPersistence";
import { isKnockoutMode, isLeagueMode } from "./tournamentModes";
import {
  getLeagueTiebreakerState,
  splitMatches,
  calculateTiebreakerTableFromMatches,
  hasTiebreakerHistory,
} from "./leagueTiebreaker";

export function isLeagueFinished(matches) {
  return (
    Array.isArray(matches) &&
    matches.length > 0 &&
    matches.every((m) => m.scoreA !== "" && m.scoreB !== "")
  );
}

export function getLeagueWinners(table) {
  const entries = Object.entries(table || {});
  if (!entries.length) return [];
  const topWon = Math.max(...entries.map(([, stats]) => stats.won));
  return entries.filter(([, stats]) => stats.won === topWon).map(([name]) => name);
}

export function getTournamentFinishInfo({ mode, matches, knockoutRounds, table }) {
  if (isLeagueMode(mode)) {
    const { regularMatches, tiebreakerMatches } = splitMatches(matches);

    if (!isLeagueFinished(regularMatches)) {
      return { finished: false };
    }

    const tieState = getLeagueTiebreakerState({ table, tiebreakerMatches });

    if (tieState.phase === "tiebreaker") {
      return {
        finished: false,
        needsTiebreaker: true,
        tiedTeams: tieState.tiedTeams,
        tiebreakerStarted: tieState.playoffStarted,
        tiebreakerNeedsNextRound: tieState.needsNextRound,
        tiebreakerTable: tieState.tiebreakerTable,
      };
    }

    const champion = tieState.champion;
    if (!champion) {
      return { finished: false };
    }

    return {
      finished: true,
      kind: "league",
      winners: [champion],
      subtitle: tieState.hadPlayoff
        ? `Tiebreaker league — ${tieState.tiedTeams?.length || 0} teams were tied`
        : `${regularMatches.length} fixture${regularMatches.length === 1 ? "" : "s"} completed`,
      hadTiebreaker: Boolean(tieState.hadPlayoff),
      tiedTeams: tieState.tiedTeams,
      tiebreakerStarted: hasTiebreakerHistory(tiebreakerMatches),
      tiebreakerTable: hasTiebreakerHistory(tiebreakerMatches)
        ? calculateTiebreakerTableFromMatches(tiebreakerMatches)
        : undefined,
    };
  }

  if (isKnockoutMode(mode)) {
    const champion = getChampion(knockoutRounds);
    if (!champion) {
      return { finished: false };
    }
    return {
      finished: true,
      kind: "knockout",
      winners: [champion],
      subtitle: "Knockout champion crowned",
    };
  }

  return { finished: false };
}

/** Dashboard card badge: null (not started), in_play, tiebreaker, or finished. */
export function getTournamentCardStatus(row) {
  const decoded = decodeFromDatabase(row);
  const { regularMatches, tiebreakerMatches } = splitMatches(decoded.matches);
  const started =
    regularMatches.length > 0 ||
    tiebreakerMatches.length > 0 ||
    decoded.knockout_rounds.length > 0;
  if (!started) return null;

  const table = calculateLeagueTable(decoded.teams, regularMatches);
  const finishInfo = getTournamentFinishInfo({
    mode: decoded.mode,
    matches: decoded.matches,
    knockoutRounds: decoded.knockout_rounds,
    table,
  });

  if (finishInfo.needsTiebreaker) return "tiebreaker";
  return finishInfo.finished ? "finished" : "in_play";
}
