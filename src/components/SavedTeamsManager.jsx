import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSavedTeams } from "../hooks/useSavedTeams";
import TeamForm from "./TeamForm";
import TeamList from "./TeamList";
import { getAuthErrorMessage } from "../lib/authErrors";

export default function SavedTeamsManager() {
  const { user } = useAuth();
  const {
    savedTeams,
    loading,
    error,
    setError,
    addSavedTeam,
    renameSavedTeam,
    removeSavedTeam,
  } = useSavedTeams(user?.id);

  const [busy, setBusy] = useState(false);

  const teamsForList = savedTeams.map((t) => ({ id: t.id, name: t.name }));

  const handleAdd = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Team name cannot be empty.");
    if (
      savedTeams.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      return setError("This team is already saved on your account.");
    }
    setBusy(true);
    setError("");
    try {
      await addSavedTeam(trimmed);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this team from your account? It will not be removed from old tournaments already saved."
      )
    ) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await removeSavedTeam(id);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async (id, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (
      savedTeams.some(
        (t) => t.id !== id && t.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      return setError("A team with this name already exists on your account.");
    }
    setBusy(true);
    setError("");
    try {
      await renameSavedTeam(id, trimmed);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="teams-page panel-card ui-card ui-card--glass">
      <p className="teams-page__hint">
        Saved to your account. Reuse them whenever you set up a tournament.
      </p>
      {error && (
        <div className="auth-form__alert auth-form__alert--error" role="alert">
          {error}
        </div>
      )}
      <TeamForm onAddTeam={handleAdd} />
      {loading ? (
        <p className="team-list__empty">Loading teams…</p>
      ) : (
        <TeamList
          teams={teamsForList}
          onDelete={busy ? undefined : handleDelete}
          onRename={busy ? undefined : handleRename}
        />
      )}
    </section>
  );
}
