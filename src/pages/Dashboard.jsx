import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  createTournament,
  deleteTournament,
  fetchTournaments,
} from "../services/tournamentService";
import { isSupabaseConfigured } from "../lib/supabase";
import { getSupabaseConfigMessage } from "../lib/supabaseConfigMessage";
import { getAuthErrorMessage } from "../lib/authErrors";
import DashboardLayout from "../components/DashboardLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
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

  const isActive = (t) =>
    (t.matches?.length ?? 0) > 0 || (t.knockout_rounds?.length ?? 0) > 0;

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
          <div className="app-loading app-loading--inline">
            <div className="app-loading__spinner" aria-hidden="true" />
            <p>Loading tournaments…</p>
          </div>
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
              const mode = t.mode === "knockout" ? "Knockout" : "League";
              const active = isActive(t);
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
                          className={`event-card__badge event-card__badge--${t.mode || "league"}`}
                        >
                          {mode}
                        </span>
                        {active && (
                          <span className="event-card__status">In play</span>
                        )}
                      </div>
                      <h3 className="event-card__name">{t.name}</h3>
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
                      <span className="event-card__cta" aria-hidden="true">
                        Open
                      </span>
                    </button>
                    <button
                      type="button"
                      className="event-card__delete"
                      onClick={(e) => handleDelete(t.id, e)}
                      aria-label={`Delete ${t.name}`}
                    >
                      Delete
                    </button>
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
