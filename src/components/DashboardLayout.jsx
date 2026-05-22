import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageShell from "./ui/PageShell";

export default function DashboardLayout({ children, title, subtitle }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Organizer";

  const closeDrawer = () => setDrawerOpen(false);

  const navItems = (
    <>
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `nav-drawer__link ${isActive ? "is-active" : ""}`
        }
        onClick={closeDrawer}
      >
        Overview
      </NavLink>
      <NavLink
        to="/teams"
        className={({ isActive }) =>
          `nav-drawer__link ${isActive ? "is-active" : ""}`
        }
        onClick={closeDrawer}
      >
        My Teams
      </NavLink>
      <button
        type="button"
        className="nav-drawer__link nav-drawer__link--muted"
        onClick={() => {
          closeDrawer();
          signOut();
        }}
      >
        Sign out
      </button>
    </>
  );

  return (
    <PageShell className="dashboard">
      <aside className="dashboard-sidebar" aria-label="Navigation">
        <div className="nav-drawer__brand">Jackaroo Tournament Manager</div>
        {navItems}
      </aside>

      {drawerOpen && (
        <>
          <button
            type="button"
            className="nav-drawer-overlay"
            aria-label="Close menu"
            onClick={closeDrawer}
          />
          <nav className="nav-drawer nav-drawer--open" aria-label="Menu">
            <div className="nav-drawer__brand">Jackaroo Tournament Manager</div>
            {navItems}
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
            <button
              type="button"
              className="dashboard__brand"
              onClick={() => navigate("/")}
            >
              J-T-M
            </button>
            <div className="dashboard__user">
              <span>Welcome</span>
              <strong>{displayName}</strong>
            </div>
          </div>
        </header>

        <main className="dashboard__main">
          {(title || subtitle) && (
            <section className="dashboard-hero">
              {subtitle && (
                <p className="dashboard-hero__eyebrow">{subtitle}</p>
              )}
              {title && <h1 className="dashboard-hero__title">{title}</h1>}
            </section>
          )}
          {children}
        </main>

        <nav className="dashboard-nav-mobile" aria-label="Mobile navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "is-active" : "")}>
            Home
          </NavLink>
          <NavLink to="/teams" className={({ isActive }) => (isActive ? "is-active" : "")}>
            Teams
          </NavLink>
        </nav>
      </div>
    </PageShell>
  );
}
