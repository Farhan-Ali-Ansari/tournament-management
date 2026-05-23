/** Postgres check_violation */
const CHECK_VIOLATION = "23514";

export function isModeConstraintError(error) {
  if (!error) return false;
  const msg = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return (
    error.code === CHECK_VIOLATION ||
    msg.includes("tournaments_mode_check") ||
    (msg.includes("check constraint") && msg.includes("mode"))
  );
}

export function getTournamentErrorMessage(error, fallback = "Failed to save") {
  if (isModeConstraintError(error)) {
    return "Custom League and Custom Knockout need a one-time database update. See the setup steps below.";
  }
  return error?.message || fallback;
}
