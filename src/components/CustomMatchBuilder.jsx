import { useState } from "react";

function pairKey(teamAId, teamBId) {
  return teamAId < teamBId ? `${teamAId}-${teamBId}` : `${teamBId}-${teamAId}`;
}

export default function CustomMatchBuilder({
  teams,
  matches,
  onMatchesChange,
  onStart,
  startLabel = "Start season",
  emptyHint = "Add fixtures below, then start when ready.",
}) {
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [localError, setLocalError] = useState("");

  const addMatch = () => {
    setLocalError("");
    if (!teamAId || !teamBId) {
      setLocalError("Select both teams.");
      return;
    }
    if (teamAId === teamBId) {
      setLocalError("Pick two different teams.");
      return;
    }
    const key = pairKey(teamAId, teamBId);
    if (matches.some((m) => m.id === key)) {
      setLocalError("This fixture already exists.");
      return;
    }
    const teamA = teams.find((t) => t.id === teamAId);
    const teamB = teams.find((t) => t.id === teamBId);
    onMatchesChange([
      ...matches,
      {
        id: key,
        teamA: teamA.name,
        teamB: teamB.name,
        scoreA: "",
        scoreB: "",
      },
    ]);
    setTeamAId("");
    setTeamBId("");
  };

  const removeMatch = (matchId) => {
    onMatchesChange(matches.filter((m) => m.id !== matchId));
  };

  return (
    <div className="custom-builder">
      <p className="custom-builder__hint">{emptyHint}</p>
      {localError && (
        <div className="auth-form__alert auth-form__alert--error" role="alert">
          {localError}
        </div>
      )}
      <div className="custom-builder__form">
        <label className="custom-builder__field">
          <span>Home team</span>
          <select
            className="team-form__input"
            value={teamAId}
            onChange={(e) => setTeamAId(e.target.value)}
          >
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <span className="custom-builder__vs">vs</span>
        <label className="custom-builder__field">
          <span>Away team</span>
          <select
            className="team-form__input"
            value={teamBId}
            onChange={(e) => setTeamBId(e.target.value)}
          >
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-action custom-builder__add" onClick={addMatch}>
          + Add fixture
        </button>
      </div>

      {matches.length > 0 && (
        <ul className="custom-builder__list">
          {matches.map((m, index) => (
            <li key={m.id} className="custom-builder__item">
              <span className="custom-builder__item-label">
                {index + 1}. {m.teamA} vs {m.teamB}
              </span>
              <button
                type="button"
                className="btn-text custom-builder__remove"
                onClick={() => removeMatch(m.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="btn-action custom-builder__start"
        onClick={onStart}
        disabled={matches.length === 0}
      >
        {startLabel}
      </button>
    </div>
  );
}
