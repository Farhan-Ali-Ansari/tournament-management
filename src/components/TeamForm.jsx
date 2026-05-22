import { useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function TeamForm({ onAddTeam, submitLabel = "Add Team" }) {
  const [teamName, setTeamName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    onAddTeam(teamName);
    setTeamName("");
  };

  return (
    <form className="team-form" onSubmit={handleSubmit}>
      <Input
        floating
        label="Team name"
        className="team-form__input-wrap"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder=" "
      />
      <Button type="submit" variant="primary" className="team-form__submit">
        {submitLabel}
      </Button>
    </form>
  );
}
