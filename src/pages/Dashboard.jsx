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

function AnimatedStat({ value, label, icon }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
    let frame = 0;
    const total = 20;
    let rafId;
    const tick = () => {
      frame++;
      setDisplay(frame >= total ? value : Math.round((value / total) * frame));
      if (frame < total) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return (
    <div className="stat-card">
      <span className="stat-card__icon" aria-hidden="true">
        {icon}
      </span>
      <div className="stat-card__value stat-card__value--animate">{display}</div>
      <div className="stat-card__label">{label}</div>
      <div className="mini-bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
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
    const totalPlayers = tournaments.reduce(
      (sum, t) => sum + (t.teams?.length ?? 0),
      0
    );
    const activeMatches = tournaments.filter(
      (t) => (t.matches?.length ?? 0) > 0 || (t.knockout_rounds?.length ?? 0) > 0
    ).length;
    return {
      totalPlayers: Math.max(totalPlayers, savedTeams.length),
      activeMatches,
      tournaments: tournaments.length,
    };
  }, [tournaments, savedTeams.length]);

  const recentActivity = useMemo(
    () =>
      [...tournaments]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 5),
    [tournaments]
  );

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

  const scrollToSection = (id) => {
    setNavTab(id);
    const el = document.getElementById(`dashboard-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setDrawerOpen(false);
  };

  const navLinks = (
    <>
      <button
        type="button"
        className={`nav-drawer__link ${navTab === "home" ? "is-active" : ""}`}
        onClick={() => scrollToSection("home")}
      >
        Home
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
      <button type="button" className="nav-drawer__link" onClick={() => signOut()}>
        Sign out
      </button>
    </>
  );

  return (
    <PageShell className="dashboard">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar" aria-label="Admin navigation">
          <div className="nav-drawer__brand">Jackaroo</div>
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
            <nav className={`nav-drawer nav-drawer--open`} aria-label="Menu">
              <div className="nav-drawer__brand">Jackaroo</div>
              {navLinks}
            </nav>
          </>
        )}

        <div className="dashboard-content">
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
              <div>
                <p className="dashboard__greeting">Hello, {displayName}</p>
                <h1 className="dashboard__title">Command Center</h1>
              </div>
            </div>
          </header>

          <main className="dashboard__main" id="dashboard-home">
            <section className="dashboard-hero">
              <p className="dashboard-hero__eyebrow">Premium tournament suite</p>
              <h2 className="dashboard-hero__title">JACKAROO TOURNAMENT</h2>
              <p className="dashboard-hero__subtitle">
                Leagues, knockouts, and live standings — crafted for mobile organizers.
              </p>
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

            <div className="dashboard-stats">
              <AnimatedStat
                value={stats.totalPlayers}
                label="Total Players"
                icon="👥"
              />
              <AnimatedStat
                value={stats.activeMatches}
                label="Active Events"
                icon="⚡"
              />
              <AnimatedStat
                value={stats.tournaments}
                label="Tournaments"
                icon="🏆"
              />
            </div>

            <div className="dashboard-quick-actions">
              <button
                type="button"
                className="quick-action-btn"
                onClick={handleCreate}
                disabled={creating || !isSupabaseConfigured}
              >
                <span className="quick-action-btn__icon">✨</span>
                New tournament
              </button>
              <button
                type="button"
                className="quick-action-btn"
                onClick={() => scrollToSection("teams")}
              >
                <span className="quick-action-btn__icon">👕</span>
                Manage teams
              </button>
            </div>

            <div id="dashboard-teams">
              <SavedTeamsManager />
            </div>

            <section id="dashboard-tournaments">
              <Button
                variant="primary"
                size="lg"
                className="dashboard__create"
                onClick={handleCreate}
                disabled={creating || !isSupabaseConfigured}
              >
                {creating ? "Creating…" : "+ New Tournament"}
              </Button>

              {loading ? (
                <div className="app-loading app-loading--inline">
                  <div className="app-loading__spinner skeleton" aria-hidden="true" />
                  <p>Loading tournaments…</p>
                </div>
              ) : tournaments.length === 0 ? (
                <Card className="empty-state dashboard__empty" hover={false}>
                  <span style={{ fontSize: "2.5rem" }} aria-hidden="true">
                    🏆
                  </span>
                  <h3>No tournaments yet</h3>
                  <p>Create one to add teams, run a league, or start a knockout cup.</p>
                </Card>
              ) : (
                <>
                  {recentActivity.length > 0 && (
                    <div className="activity-feed">
                      <h3 className="activity-feed__title">Recent activity</h3>
                      {recentActivity.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className="activity-item"
                          onClick={() => navigate(`/tournament/${t.id}`)}
                        >
                          <span className="activity-item__dot" />
                          <span className="activity-item__body">
                            <span className="activity-item__name">{t.name}</span>
                            <span className="activity-item__meta">
                              {(t.teams?.length ?? 0)} teams ·{" "}
                              {t.mode === "knockout" ? "Knockout" : "League"} ·{" "}
                              {formatDate(t.updated_at)}
                            </span>
                          </span>
                          <span aria-hidden="true">→</span>
                        </button>
                      ))}
                    </div>
                  )}

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
                </>
              )}
            </section>
          </main>

          <nav className="dashboard-nav-mobile" aria-label="Mobile navigation">
            <button
              type="button"
              className={navTab === "home" ? "is-active" : ""}
              onClick={() => scrollToSection("home")}
            >
              <span className="nav-icon">🏠</span>
              Home
            </button>
            <button
              type="button"
              className={navTab === "teams" ? "is-active" : ""}
              onClick={() => scrollToSection("teams")}
            >
              <span className="nav-icon">👕</span>
              Teams
            </button>
            <button
              type="button"
              className={navTab === "tournaments" ? "is-active" : ""}
              onClick={() => scrollToSection("tournaments")}
            >
              <span className="nav-icon">🏆</span>
              Events
            </button>
            <button type="button" onClick={() => signOut()}>
              <span className="nav-icon">↪</span>
              Exit
            </button>
          </nav>

          <button
            type="button"
            className="fab"
            aria-label="Create tournament"
            onClick={handleCreate}
            disabled={creating || !isSupabaseConfigured}
          >
            +
          </button>
        </div>
      </div>
    </PageShell>
  );
}
