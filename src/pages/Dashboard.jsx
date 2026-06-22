import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createTournament,
  deleteTournament,
  duplicateTournament,
  fetchTournaments,
  renameTournament,
} from "../services/tournamentService";
import { isSupabaseConfigured } from "../lib/supabase";
import { getSupabaseConfigMessage } from "../lib/supabaseConfigMessage";
import { getAuthErrorMessage } from "../lib/authErrors";
import DashboardLayout from "../components/DashboardLayout";
import PageLoading from "../components/ui/PageLoading";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { getModeLabel } from "../lib/tournamentModes";
import { resolveAppMode } from "../lib/tournamentPersistence";
import { getTournamentCardStatus } from "../lib/tournamentCompletion";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

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
    setBusyId(id);
    try {
      await deleteTournament(id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRename = async (t, e) => {
    e.stopPropagation();
    const next = window.prompt("Rename tournament", t.name?.trim() || "Untitled tournament");
    if (next == null) return;
    const trimmed = next.trim();
    if (!trimmed) {
      setError("Name cannot be empty.");
      return;
    }
    setBusyId(t.id);
    setError("");
    try {
      await renameTournament(t.id, trimmed);
      setTournaments((prev) =>
        prev.map((row) => (row.id === t.id ? { ...row, name: trimmed } : row))
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    if (!user?.id) return;
    setBusyId(id);
    setError("");
    try {
      const copy = await duplicateTournament(user.id, id);
      await loadTournaments();
      navigate(`/tournament/${copy.id}/setup`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
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
    <DashboardLayout title="Your events" subtitle="Tournament suite">
      {!isSupabaseConfigured && (
        <div className="auth-form__alert auth-form__alert--error" role="alert">
          {getSupabaseConfigMessage()}
        </div>
      )}

      {error && (
        <div className="auth-form__alert auth-form__alert--error" role="alert">
          {error}
        </div>
      )}

      <section className="events-section">
        <div className="events-section__head">
          <div>
            <h2 className="events-section__title">Tournaments</h2>
            <p className="events-section__hint">
              {tournaments.length === 0
                ? "Create your first competition"
                : `${tournaments.length} event${tournaments.length === 1 ? "" : "s"} on your account`}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={creating || !isSupabaseConfigured}
          >
            {creating ? "Creating…" : "+ New"}
          </Button>
        </div>

        {loading ? (
          <PageLoading message="Loading tournaments…" inline />
        ) : tournaments.length === 0 ? (
          <Card className="events-empty" hover={false}>
            <div className="events-empty__icon" aria-hidden="true" />
            <h3>No tournaments yet</h3>
            <p>Start a league season or knockout cup in a few taps.</p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreate}
              disabled={creating || !isSupabaseConfigured}
            >
              Create tournament
            </Button>
          </Card>
        ) : (
          <ul className="events-grid">
            {tournaments.map((t, index) => {
              const appMode = resolveAppMode(t);
              const mode = getModeLabel(appMode);
              const cardStatus = getTournamentCardStatus(t);
              const isBusy = busyId === t.id;
              return (
                <li
                  key={t.id}
                  className="events-grid__item"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <article className="event-card">
                    <button
                      type="button"
                      className="event-card__body"
                      onClick={() => navigate(`/tournament/${t.id}`)}
                    >
                      <div className="event-card__header">
                        <span
                          className={`event-card__badge event-card__badge--${appMode}`}
                        >
                          {mode}
                        </span>
                        {cardStatus && (
                          <span
                            className={`event-card__status event-card__status--${cardStatus}`}
                          >
                            {cardStatus === "finished"
                              ? "Finished"
                              : cardStatus === "tiebreaker"
                                ? "Tiebreaker"
                                : "In play"}
                          </span>
                        )}
                      </div>
                      <h3 className="event-card__name">
                        {t.name?.trim() || "Untitled tournament"}
                      </h3>
                      <div className="event-card__meta">
                        <span className="event-card__stat">
                          <span className="event-card__stat-value">
                            {t.teams?.length ?? 0}
                          </span>
                          <span className="event-card__stat-label">Teams</span>
                        </span>
                        <span className="event-card__divider" aria-hidden="true" />
                        <span className="event-card__date">
                          {formatDate(t.updated_at)}
                        </span>
                      </div>
                    </button>
                    <div className="event-card__actions">
                      <button
                        type="button"
                        className="event-card__action"
                        onClick={(e) => handleRename(t, e)}
                        disabled={isBusy}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        className="event-card__action"
                        onClick={(e) => handleDuplicate(t.id, e)}
                        disabled={isBusy}
                      >
                        Duplicate
                      </button>
                      <button
                        type="button"
                        className="event-card__delete"
                        onClick={(e) => handleDelete(t.id, e)}
                        disabled={isBusy}
                        aria-label={`Delete ${t.name}`}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
}
