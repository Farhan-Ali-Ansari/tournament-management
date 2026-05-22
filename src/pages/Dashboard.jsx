import { useCallback, useEffect, useMemo, useState } from "react";
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
import SavedTeamsManager from "../components/SavedTeamsManager";
import PageShell from "../components/ui/PageShell";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useSavedTeams } from "../hooks/useSavedTeams";

function StatCard({ value, label }) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { savedTeams } = useSavedTeams(user?.id);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navTab, setNavTab] = useState("home");

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

  const stats = useMemo(() => {
    const totalTeams = tournaments.reduce(
      (sum, t) => sum + (t.teams?.length ?? 0),
      0
    );
    return {
      teams: Math.max(totalTeams, savedTeams.length),
      tournaments: tournaments.length,
      active: tournaments.filter(
        (t) => (t.matches?.length ?? 0) > 0 || (t.knockout_rounds?.length ?? 0) > 0
      ).length,
    };
  }, [tournaments, savedTeams.length]);

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
      });
    } catch {
      return "";
    }
  };

  const scrollToSection = (id) => {
    setNavTab(id);
    document.getElementById(`dashboard-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setDrawerOpen(false);
  };

  const navLinks = (
    <>
      <button
        type="button"
        className={`nav-drawer__link ${navTab === "home" ? "is-active" : ""}`}
        onClick={() => scrollToSection("home")}
      >
        Overview
      </button>
      <button
        type="button"
        className={`nav-drawer__link ${navTab === "teams" ? "is-active" : ""}`}
        onClick={() => scrollToSection("teams")}
      >
        My Teams
      </button>
      <button
        type="button"
        className={`nav-drawer__link ${navTab === "tournaments" ? "is-active" : ""}`}
        onClick={() => scrollToSection("tournaments")}
      >
        Tournaments
      </button>
      <button
        type="button"
        className="nav-drawer__link nav-drawer__link--muted"
        onClick={() => signOut()}
      >
        Sign out
      </button>
    </>
  );

  return (
    <PageShell className="dashboard">
      <aside className="dashboard-sidebar" aria-label="Navigation">
        <div className="nav-drawer__brand">Jackaroo Tournament Manager</div>
        {navLinks}
      </aside>

      {drawerOpen && (
        <>
          <button
            type="button"
            className="nav-drawer-overlay"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <nav className="nav-drawer nav-drawer--open" aria-label="Menu">
            <div className="nav-drawer__brand">Jackaroo Tournament Manager</div>
            {navLinks}
          </nav>
        </>
      )}

      <div className="dashboard-body">
          <header className="dashboard__header">
            <div className="dashboard__header-inner">
              <button
                type="button"
                className="hamburger-btn"
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
              >
                ☰
              </button>
              <span className="dashboard__brand">JTM</span>
              <div className="dashboard__user">
                <span>Welcome</span>
                <strong>{displayName}</strong>
              </div>
            </div>
          </header>

          <main className="dashboard__main" id="dashboard-home">
            <section className="dashboard-hero">
              <p className="dashboard-hero__eyebrow">Tournament suite</p>
              <h1 className="dashboard-hero__title">Your events</h1>
            </section>

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

            

            <Button
              variant="primary"
              size="lg"
              className="dashboard-cta"
              onClick={handleCreate}
              disabled={creating || !isSupabaseConfigured}
            >
              {creating ? "Creating…" : "New tournament"}
            </Button>

            <div id="dashboard-teams">
              <SavedTeamsManager />
            </div>

            <section id="dashboard-tournaments">
              <h2 className="dashboard__section-title">Tournaments</h2>
              <p className="dashboard__section-hint">
                Tap an event to open fixtures, scores, and standings.
              </p>

              {loading ? (
                <div className="app-loading app-loading--inline">
                  <div className="app-loading__spinner" aria-hidden="true" />
                  <p>Loading…</p>
                </div>
              ) : tournaments.length === 0 ? (
                <Card className="empty-state dashboard__empty" hover={false}>
                  <h3>No tournaments yet</h3>
                  <p>Create one to add teams and start your competition.</p>
                </Card>
              ) : (
                <ul className="tournament-list">
                  {tournaments.map((t) => (
                    <li key={t.id} className="tournament-list__item">
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
            </section>
          </main>

          <nav className="dashboard-nav-mobile" aria-label="Mobile navigation">
            <button
              type="button"
              className={navTab === "home" ? "is-active" : ""}
              onClick={() => scrollToSection("home")}
            >
              Home
            </button>
            <button
              type="button"
              className={navTab === "teams" ? "is-active" : ""}
              onClick={() => scrollToSection("teams")}
            >
              Teams
            </button>
            <button
              type="button"
              className={navTab === "tournaments" ? "is-active" : ""}
              onClick={() => scrollToSection("tournaments")}
            >
              Events
            </button>
          </nav>
      </div>
    </PageShell>
  );
}
