export const MODES = {
  LEAGUE: "league",
  KNOCKOUT: "knockout",
  CUSTOM_LEAGUE: "custom_league",
  CUSTOM_KNOCKOUT: "custom_knockout",
};

export const ALL_MODES = Object.values(MODES);

export function isLeagueMode(mode) {
  return mode === MODES.LEAGUE || mode === MODES.CUSTOM_LEAGUE;
}

export function isKnockoutMode(mode) {
  return mode === MODES.KNOCKOUT || mode === MODES.CUSTOM_KNOCKOUT;
}

export function isCustomMode(mode) {
  return mode === MODES.CUSTOM_LEAGUE || mode === MODES.CUSTOM_KNOCKOUT;
}

export function getModeLabel(mode) {
  switch (mode) {
    case MODES.KNOCKOUT:
      return "Knockout";
    case MODES.CUSTOM_LEAGUE:
      return "Custom League";
    case MODES.CUSTOM_KNOCKOUT:
      return "Custom Knockout";
    case MODES.LEAGUE:
    default:
      return "League";
  }
}

export function normalizeMode(mode) {
  return ALL_MODES.includes(mode) ? mode : MODES.LEAGUE;
}
