import TeamForm from "./TeamForm";
import TeamList from "./TeamList";

export default function TournamentTeamPicker({
  savedTeams,
  tournamentTeams,
  onAddNewTeam,
  onToggleSavedTeam,
  onRemoveFromTournament,
  onRenameInTournament,
  savedLoading,
}) {
  const selectedIds = new Set(tournamentTeams.map((t) => t.id));

  return (
    <div className="tournament-team-picker">
      <TeamForm onAddTeam={onAddNewTeam} />
      {savedLoading ? (
        <p className="team-list__empty">Loading your teams…</p>
      ) : savedTeams.length > 0 ? (
        <div className="saved-team-chips">
          <p className="saved-team-chips__label">Add from your saved teams</p>
          <div className="saved-team-chips__row">
            {savedTeams.map((team) => {
              const selected = selectedIds.has(team.id);
              return (
                <button
                  key={team.id}
                  type="button"
                  className={`saved-team-chip ${selected ? "saved-team-chip--on" : ""}`}
                  onClick={() => onToggleSavedTeam(team)}
                >
                  {selected ? "✓ " : "+ "}
                  {team.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="team-list__empty">
          No saved teams yet. Add one above — it will be remembered on your account.
        </p>
      )}
      <div className="tournament-team-picker__selected">
        <p className="saved-team-chips__label">Teams in this tournament ({tournamentTeams.length})</p>
        <TeamList
          teams={tournamentTeams}
          onDelete={onRemoveFromTournament}
          onRename={onRenameInTournament}
        />
      </div>
    </div>
  );
}
