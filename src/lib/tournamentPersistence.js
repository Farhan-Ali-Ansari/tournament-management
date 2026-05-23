import { MODES, normalizeMode } from "./tournamentModes";

/** Hidden marker in matches JSON — not shown in UI. Avoids DB mode constraint changes. */
export const FORMAT_META_ID = "__format_meta__";

function createFormatMeta(variant) {
  return {
    id: FORMAT_META_ID,
    variant,
    teamA: "",
    teamB: "",
    scoreA: "",
    scoreB: "",
  };
}

export function stripFormatMeta(matches) {
  if (!Array.isArray(matches)) return [];
  return matches.filter((m) => m?.id !== FORMAT_META_ID);
}

export function getFormatMeta(matches) {
  if (!Array.isArray(matches)) return null;
  return matches.find((m) => m?.id === FORMAT_META_ID) ?? null;
}

/** App mode from a database row (supports migrated DB or meta-encoded rows). */
export function resolveAppMode(row) {
  const dbMode = normalizeMode(row?.mode);
  const meta = getFormatMeta(row?.matches);
  if (meta?.variant === MODES.CUSTOM_LEAGUE || meta?.variant === MODES.CUSTOM_KNOCKOUT) {
    return meta.variant;
  }
  if (dbMode === MODES.CUSTOM_LEAGUE || dbMode === MODES.CUSTOM_KNOCKOUT) {
    return dbMode;
  }
  return dbMode;
}

export function decodeFromDatabase(row) {
  const mode = resolveAppMode(row);
  return {
    name: typeof row?.name === "string" ? row.name : "",
    mode,
    teams: Array.isArray(row?.teams) ? row.teams : [],
    matches: stripFormatMeta(row?.matches),
    knockout_rounds: Array.isArray(row?.knockout_rounds) ? row.knockout_rounds : [],
  };
}

/** Maps custom modes to league/knockout for DB while preserving variant in matches meta. */
export function encodeForDatabase({ name, mode, teams, matches, knockout_rounds }) {
  const realMatches = stripFormatMeta(matches);

  if (mode === MODES.CUSTOM_LEAGUE) {
    return {
      name,
      mode: MODES.LEAGUE,
      teams,
      matches: [createFormatMeta(MODES.CUSTOM_LEAGUE), ...realMatches],
      knockout_rounds: [],
    };
  }

  if (mode === MODES.CUSTOM_KNOCKOUT) {
    return {
      name,
      mode: MODES.KNOCKOUT,
      teams,
      matches: [createFormatMeta(MODES.CUSTOM_KNOCKOUT), ...realMatches],
      knockout_rounds: knockout_rounds ?? [],
    };
  }

  return {
    name,
    mode,
    teams,
    matches: realMatches,
    knockout_rounds: knockout_rounds ?? [],
  };
}
