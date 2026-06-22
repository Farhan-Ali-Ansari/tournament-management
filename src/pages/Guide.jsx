import DashboardLayout from "../components/DashboardLayout";

const sections = [
  {
    id: "welcome",
    title: "Welcome",
    content: (
      <>
        <p>
          <strong>Jackaroo Tournament Manager</strong> helps you run league seasons and
          knockout cups from your phone or desktop. Everything saves automatically to your
          account in the cloud.
        </p>
        <p>Each tournament uses one of four formats:</p>
        <ul className="guide-list">
          <li>
            <strong>League</strong> — automatic round-robin fixtures for every team pairing.
          </li>
          <li>
            <strong>Custom League</strong> — you choose which fixtures are played.
          </li>
          <li>
            <strong>Knockout</strong> — automatic single-elimination bracket (with byes if needed).
          </li>
          <li>
            <strong>Custom Knockout</strong> — you set first-round pairings, then the bracket builds.
          </li>
        </ul>
        <p className="guide-note">
          Pick your format at the start. You cannot change it after matches or a bracket exist
          without resetting the tournament.
        </p>
      </>
    ),
  },
  {
    id: "account",
    title: "Account & sign in",
    content: (
      <>
        <ol className="guide-steps">
          <li>Create an account on the <strong>Sign up</strong> page with your email.</li>
          <li>Sign in from <strong>Sign in</strong>. Tournaments and saved teams stay on your account.</li>
          <li>Use <strong>Sign out</strong> in the sidebar on a shared device.</li>
        </ol>
        <p className="guide-note">
          The app needs Supabase configured (see the project README). A warning on the dashboard
          means setup is incomplete — fix that before creating events.
        </p>
      </>
    ),
  },
  {
    id: "dashboard",
    title: "Dashboard — your events",
    content: (
      <>
        <p>
          <strong>Overview</strong> lists every tournament. Each card shows the format badge, team
          count, last updated date, <strong>In play</strong> while fixtures or a bracket are
          ongoing, <strong>Tiebreaker</strong> when the league ended in a tie at the top, and{" "}
          <strong>Finished</strong> when every league score is in (with a single champion, including
          after tiebreaker playoffs) or a knockout champion is crowned.
        </p>
        <ul className="guide-list">
          <li>
            <strong>+ New</strong> — creates a tournament and opens setup.
          </li>
          <li>
            <strong>Open</strong> — continue setup, teams, or the game view.
          </li>
          <li>
            <strong>Rename</strong> — change the tournament title from the card menu.
          </li>
          <li>
            <strong>Duplicate</strong> — copy teams and format into a new tournament.
          </li>
          <li>
            <strong>Delete</strong> — removes the tournament permanently.
          </li>
        </ul>
        <p>
          Tournaments without a name show as <strong>Untitled tournament</strong> on the dashboard
          until you enter a name in setup.
        </p>
      </>
    ),
  },
  {
    id: "saved-teams",
    title: "Saved teams (roster library)",
    content: (
      <>
        <p>
          Open <strong>Saved Teams</strong> in the sidebar to keep a reusable roster on your account.
        </p>
        <ul className="guide-list">
          <li>Add, rename, or delete saved team names anytime.</li>
          <li>During setup, tap chips to add saved teams to a tournament quickly.</li>
          <li>You can still add one-off teams for a single event without saving them globally.</li>
        </ul>
        <p className="guide-note">
          Deleting a saved team does not change tournaments you already created.
        </p>
      </>
    ),
  },
  {
    id: "create",
    title: "Creating a tournament",
    content: (
      <>
        <ol className="guide-steps">
          <li>
            From Overview, tap <strong>+ New</strong> (or <strong>Create tournament</strong> if you
            have none).
          </li>
          <li>
            <strong>Step 1 — Setup:</strong> enter a <strong>tournament name</strong> (required).
            Then pick one of the four format cards. <strong>Next: Choose teams</strong> stays disabled
            until the name is filled in.
          </li>
          <li>
            <strong>Step 2 — Teams:</strong> add at least two teams using saved chips or new names.
            Rename or remove teams before starting play.
          </li>
          <li>
            <strong>Game view:</strong> start fixtures or a bracket (or build custom fixtures /
            pairings first). The app opens the right screen for your format.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "formats",
    title: "Choosing a format",
    content: (
      <>
        <ul className="guide-list">
          <li>
            <strong>League</strong> — tap <strong>Start league season</strong> to generate every
            team-vs-team fixture once.
          </li>
          <li>
            <strong>Custom League</strong> — add fixtures with the team dropdowns, then{" "}
            <strong>Start custom league</strong>.
          </li>
          <li>
            <strong>Knockout</strong> — tap <strong>Start knockout cup</strong> for a random
            single-elimination bracket.
          </li>
          <li>
            <strong>Custom Knockout</strong> — add first-round matches (optional bye if away team is
            empty), then <strong>Build bracket</strong>.
          </li>
        </ul>
        <p className="guide-note">
          Format badges on the dashboard use distinct colors so you can tell League, Custom League,
          Knockout, and Custom Knockout apart at a glance.
        </p>
      </>
    ),
  },
  {
    id: "league",
    title: "League & Custom League",
    content: (
      <>
        <h4 className="guide-subtitle">Fixtures tab</h4>
        <ul className="guide-list">
          <li>
            Enter <strong>0</strong> or <strong>1</strong> for each team — the other score updates
            automatically (win = 1, loss = 0).
          </li>
          <li>Clear a score to reset a match to pending.</li>
          <li>Standings update when both scores are filled.</li>
          <li>Use <strong>Search teams</strong> to filter the fixture list.</li>
        </ul>
        <h4 className="guide-subtitle">Standings tab</h4>
        <ul className="guide-list">
          <li>
            Columns: <strong>Played</strong>, <strong>Won</strong>, <strong>Lost</strong>, plus{" "}
            <strong>View</strong> for details.
          </li>
          <li>Teams sort by most wins, then fewer losses, then more games played.</li>
          <li>
            Tap <strong>View</strong> to open a popup with Played / Won / Lost, full fixture list
            (played matches first), screenshot export, and Win / Loss / Pending results.
          </li>
        </ul>
        <h4 className="guide-subtitle">Tiebreaker tab</h4>
        <ul className="guide-list">
          <li>
            When every fixture is scored and two or more teams are tied for most wins, the season
            is not finished until a tiebreaker decides one champion.
          </li>
          <li>
            Open the <strong>Tiebreaker</strong> tab and tap <strong>Start tiebreaker league</strong>{" "}
            to generate a separate mini-league between the tied teams only.
          </li>
          <li>
            Tiebreaker has its own <strong>Fixtures</strong> and <strong>Standings</strong> tabs —
            stats are separate from the main season table.
          </li>
          <li>
            Enter scores the same way (0/1). If teams are still tied after every tiebreaker
            fixture, start another tiebreaker round.
          </li>
          <li>
            Tiebreaker fixtures and standings stay on the <strong>Tiebreaker</strong> tab after
            the tournament finishes — separate from the main season, kept as a permanent record.
          </li>
          <li>Shared fixture links show the tiebreaker league while it is in progress and after.</li>
        </ul>
        <h4 className="guide-subtitle">Actions</h4>
        <ul className="guide-list">
          <li>
            <strong>Copy share link</strong> — read-only fixtures page for others (use{" "}
            <strong>Stop sharing</strong> to revoke).
          </li>
          <li>
            <strong>Regenerate fixtures</strong> (League) — new full schedule; scores cleared.
          </li>
          <li>
            <strong>Edit fixtures</strong> (Custom League) — back to the fixture builder; scores
            cleared when you restart.
          </li>
          <li>
            <strong>Save screenshot</strong> — PNG of the current fixtures or standings tab.
          </li>
        </ul>
        <p className="guide-note">
          On small screens, action buttons stack full width under the table for easier tapping.
        </p>
      </>
    ),
  },
  {
    id: "knockout",
    title: "Knockout & Custom Knockout",
    content: (
      <>
        <p>
          Standard knockout shuffles teams into a bracket. Custom knockout lets you define round-one
          pairings (and byes) before later rounds are generated.
        </p>
        <ul className="guide-list">
          <li>
            <strong>Pick winners</strong> — tap a team name when both slots are filled.
          </li>
          <li>
            <strong>BYE</strong> — a lone team advances automatically.
          </li>
          <li>
            <strong>Undo</strong> — clear a winner and pick again.
          </li>
          <li>
            <strong>Champion banner</strong> — shown when the final is decided.
          </li>
          <li>
            Swipe the bracket horizontally on wide trees; scroll the page vertically as usual.
          </li>
          <li>
            <strong>Reset bracket</strong> or <strong>Edit pairings</strong> — start over from round
            one.
          </li>
          <li>
            <strong>Save screenshot</strong> — exports the bracket (and champion if shown).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "game-sidebar",
    title: "During a tournament (game view)",
    content: (
      <>
        <p>The main area shows fixtures, standings, or the bracket. Extra tools:</p>
        <h4 className="guide-subtitle">Mobile bottom bar</h4>
        <ul className="guide-list">
          <li>
            <strong>Teams</strong> — back to the team list step.
          </li>
          <li>
            <strong>Roster</strong> — slide-out panel to add, rename, or remove teams.
          </li>
          <li>
            <strong>Table</strong> — jump to standings (league formats, when the season has started).
          </li>
          <li>
            <strong>Export</strong> — same as Save screenshot.
          </li>
        </ul>
        <h4 className="guide-subtitle">Roster drawer</h4>
        <ul className="guide-list">
          <li>
            <strong>Concierge guide</strong> — this help page.
          </li>
          <li>
            <strong>Buy me a coffee</strong> — support link.
          </li>
          <li>
            <strong>Save screenshot</strong> — export the current view.
          </li>
          <li>
            <strong>Reset all</strong> — clears teams, scores, and bracket; returns to format setup.
          </li>
        </ul>
        <p className="guide-note">
          On desktop (wide screen), the team roster stays in the left column while the competition
          fills the main panel.
        </p>
      </>
    ),
  },
  {
    id: "autosave",
    title: "Auto-save & data",
    content: (
      <>
        <ul className="guide-list">
          <li>Changes save to the cloud as you work — look for <strong>Saving…</strong> briefly.</li>
          <li>Sign in on another device to continue the same tournaments.</li>
          <li>
            Each event stores name, format, teams, league matches, and knockout rounds together.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "screenshots",
    title: "Screenshots & sharing",
    content: (
      <>
        <p>
          <strong>Save screenshot</strong> (or <strong>Export</strong> on mobile) downloads a PNG of
          the current export area — league fixtures, standings table, or knockout bracket.
        </p>
        <p className="guide-note">
          Start the season or bracket first. If nothing is ready to export, the app will ask you to
          begin the competition.
        </p>
      </>
    ),
  },
  {
    id: "tips",
    title: "Tips & troubleshooting",
    content: (
      <>
        <ul className="guide-list">
          <li>
            Need a different format? Use <strong>Reset all</strong> or delete the event and create a
            new one.
          </li>
          <li>Format cards lock after fixtures or a bracket exist — this protects live data.</li>
          <li>At least <strong>two teams</strong> are required before play can start.</li>
          <li>
            Tournament name is required before leaving setup — you cannot continue with a blank name.
          </li>
          <li>If saving fails, check your connection; errors appear at the top of the screen.</li>
        </ul>
      </>
    ),
  },
];

export default function Guide() {
  return (
    <DashboardLayout title="Concierge guide" subtitle="Jackaroo Tournament Manager">
      <article className="guide-page">
        <header className="guide-hero">
          <p className="guide-hero__eyebrow">The complete experience</p>
          <h2 className="guide-hero__title">How to use your tournament suite</h2>
          <p className="guide-hero__lead">
            Four competition formats, cloud save, standings with match details, and exportable
            tables and brackets — all in one place.
          </p>
        </header>

        <nav className="guide-toc" aria-label="On this page">
          <p className="guide-toc__label">Contents</p>
          <ol className="guide-toc__list">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="guide-sections">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="guide-section"
              style={{ "--section-i": index }}
            >
              <div className="guide-section__head">
                <span className="guide-section__num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="guide-section__title">{section.title}</h3>
              </div>
              <div className="guide-section__body">{section.content}</div>
            </section>
          ))}
        </div>
      </article>
    </DashboardLayout>
  );
}
