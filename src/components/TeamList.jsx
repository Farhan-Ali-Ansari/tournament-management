import { useState } from "react";

export default function TeamList({ teams, onDelete, onRename }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (team) => {
    setEditingId(team.id);
    setEditValue(team.name);
  };

  const saveEdit = () => {
    if (editingId == null) return;
    onRename?.(editingId, editValue);
    setEditingId(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  return (
    <div className="team-list-container">
      {teams.length === 0 && <p className="team-list__empty">No teams added yet</p>}

      <ul className="team-list">
        {teams.map((team) => (
          <li key={team.id} className="team-item">
            {editingId === team.id ? (
              <div className="team-item__edit">
                <input
                  type="text"
                  className="team-item__input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  autoFocus
                  aria-label="Edit team name"
                />
                <button type="button" className="team-item__save-btn" onClick={saveEdit}>Save</button>
                <button type="button" className="team-item__cancel-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            ) : (
              <>
                <span
                  className="team-item__name team-item__name--editable"
                  onClick={() => onRename && startEdit(team)}
                  title={onRename ? "Click to edit name" : undefined}
                >
                  {team.name}
                </span>
                <button
                  type="button"
                  className="team-item__delete-btn"
                  onClick={() => onDelete(team.id)}
                  aria-label={`Delete ${team.name}`}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
