import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createTournament,
  deleteTournament,
  fetchTournaments,
} from "../services/tournamentService";
import { isSupabaseConfigured } from "../lib/supabase";
import { getAuthErrorMessage } from "../lib/authErrors";
import SavedTeamsManager from "../components/SavedTeamsManager";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Organizer";

  const loadTournaments = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchTournaments(user.id);
      setTournaments(list);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const handleCreate = async () => {
    if (!user?.id) return;
    setCreating(true);
    setError("");
    try {
      const t = await createTournament(user.id);
      navigate(`/tournament/${t.id}/setup`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this tournament? This cannot be undone.")) return;
    try {
      await deleteTournament(id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-inner">
          <div>
            <p className="dashboard__greeting">Hello, {displayName}</p>
            <h1 className="dashboard__title">Your Tournaments</h1>
          </div>
          <button
            type="button"
            className="btn-text dashboard__signout"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard__main">
        {!isSupabaseConfigured && (
          <div className="auth-form__alert auth-form__alert--error" role="alert">
            Supabase is not configured. Copy <code>.env.example</code> to{" "}
            <code>.env.local</code> and add your project URL and anon key.
          </div>
        )}

        {error && (
          <div className="auth-form__alert auth-form__alert--error" role="alert">
            {error}
          </div>
        )}

        <SavedTeamsManager />

        <button
          type="button"
          className="btn-primary-large dashboard__create"
          onClick={handleCreate}
          disabled={creating || !isSupabaseConfigured}
        >
          {creating ? "Creating…" : "+ New Tournament"}
        </button>

        {loading ? (
          <div className="app-loading app-loading--inline">
            <div className="app-loading__spinner" aria-hidden="true" />
            <p>Loading tournaments…</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="empty-state dashboard__empty">
            <h3>No tournaments yet</h3>
            <p>Create one to add teams, run a league, or start a knockout cup.</p>
          </div>
        ) : (
          <ul className="tournament-cards">
            {tournaments.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="tournament-card"
                  onClick={() => navigate(`/tournament/${t.id}`)}
                >
                  <span className="tournament-card__name">{t.name}</span>
                  <span className="tournament-card__meta">
                    {(t.teams?.length ?? 0)} teams ·{" "}
                    {t.mode === "knockout" ? "Knockout" : "League"} ·{" "}
                    {formatDate(t.updated_at)}
                  </span>
                </button>
                <button
                  type="button"
                  className="tournament-card__delete"
                  onClick={(e) => handleDelete(t.id, e)}
                  aria-label={`Delete ${t.name}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
