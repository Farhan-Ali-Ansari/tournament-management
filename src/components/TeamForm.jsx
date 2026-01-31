import { useState } from "react";

export default function TeamForm({ onAddTeam }) {
  const [teamName, setTeamName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!teamName.trim()) return;

    onAddTeam(teamName);
    setTeamName("");
  };

  return (
    <form className="team-form" onSubmit={handleSubmit}>
      <input
        className="team-form__input"
        type="text"
        placeholder="Enter team name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
      />
      <button type="submit" className="team-form__submit">Add Team</button>
    </form>
  );
}
