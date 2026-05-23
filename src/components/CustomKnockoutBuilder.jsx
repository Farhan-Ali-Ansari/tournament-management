import { useState } from "react";

function pairKey(teamAId, teamBId) {
  return teamAId < teamBId ? `${teamAId}-${teamBId}` : `${teamBId}-${teamAId}`;
}

export default function CustomKnockoutBuilder({
  teams,
  pairings,
  onPairingsChange,
  onStart,
}) {
  const [teamAId, setTeamAId] = useState("");
  const [teamBId, setTeamBId] = useState("");
  const [localError, setLocalError] = useState("");

  const usedTeams = new Set();
  pairings.forEach((p) => {
    if (p.teamA) usedTeams.add(p.teamA);
    if (p.teamB && p.teamB !== "BYE") usedTeams.add(p.teamB);
  });

  const addPairing = () => {
    setLocalError("");
    if (!teamAId) {
      setLocalError("Select at least one team.");
      return;
    }
    const teamA = teams.find((t) => t.id === teamAId);
    if (teamBId) {
      if (teamAId === teamBId) {
        setLocalError("Pick two different teams, or leave away empty for a bye.");
        return;
      }
      const teamB = teams.find((t) => t.id === teamBId);
      const key = pairKey(teamAId, teamBId);
      if (pairings.some((p) => p.id === key)) {
        setLocalError("This pairing already exists.");
        return;
      }
      if (usedTeams.has(teamA.name) || usedTeams.has(teamB.name)) {
        setLocalError("A team can only appear in one first-round match.");
        return;
      }
      onPairingsChange([
        ...pairings,
        {
          id: key,
          teamA: teamA.name,
          teamB: teamB.name,
          winner: "",
        },
      ]);
    } else {
      if (usedTeams.has(teamA.name)) {
        setLocalError("This team is already in a match.");
        return;
      }
      onPairingsChange([
        ...pairings,
        {
          id: `bye-${teamAId}`,
          teamA: teamA.name,
          teamB: "BYE",
          winner: teamA.name,
        },
      ]);
    }
    setTeamAId("");
    setTeamBId("");
  };

  const removePairing = (id) => {
    onPairingsChange(pairings.filter((p) => p.id !== id));
  };

  return (
    <div className="custom-builder">
      <p className="custom-builder__hint">
        Add first-round pairings. Leave away team empty for an automatic bye.
      </p>
      {localError && (
        <div className="auth-form__alert auth-form__alert--error" role="alert">
          {localError}
        </div>
      )}
      <div className="custom-builder__form">
        <label className="custom-builder__field">
          <span>Team 1</span>
          <select
            className="team-form__input"
            value={teamAId}
            onChange={(e) => setTeamAId(e.target.value)}
          >
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id} disabled={usedTeams.has(t.name)}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <span className="custom-builder__vs">vs</span>
        <label className="custom-builder__field">
          <span>Team 2 (optional)</span>
          <select
            className="team-form__input"
            value={teamBId}
            onChange={(e) => setTeamBId(e.target.value)}
          >
            <option value="">Bye</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id} disabled={usedTeams.has(t.name)}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn-action custom-builder__add" onClick={addPairing}>
          + Add match
        </button>
      </div>

      {pairings.length > 0 && (
        <ul className="custom-builder__list">
          {pairings.map((p, index) => (
            <li key={p.id} className="custom-builder__item">
              <span className="custom-builder__item-label">
                {index + 1}. {p.teamA} vs {p.teamB}
              </span>
              <button
                type="button"
                className="btn-text custom-builder__remove"
                onClick={() => removePairing(p.id)}
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
        disabled={pairings.length === 0}
      >
        Build bracket
      </button>
    </div>
  );
}
