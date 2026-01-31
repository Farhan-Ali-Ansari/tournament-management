export default function TeamList({ teams, onDelete }) {
  return (
    <div className="team-list-container">
      {teams.length === 0 && <p className="team-list__empty">No teams added yet</p>}

      <ul className="team-list">
        {teams.map((team) => (
          <li key={team.id} className="team-item">
            <span className="team-item__name">{team.name}</span>
            <button
              type="button"
              className="team-item__delete-btn"
              onClick={() => onDelete(team.id)}
              aria-label={`Delete ${team.name}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
