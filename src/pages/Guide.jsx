import DashboardLayout from "../components/DashboardLayout";

const sections = [
  {
    id: "welcome",
    title: "Welcome",
    content: (
      <>
        <p>
          <strong>Jackaroo Tournament Manager</strong> is your private suite for running
          league seasons and knockout cups. Everything saves automatically to your account
          in the cloud, so you can pick up on any device where you are signed in.
        </p>
        <p>
          Each tournament is dedicated to <strong>one format only</strong> — League{" "}
          <em>or</em> Knockout — keeping fixtures, tables, and brackets clear and focused.
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
          <li>Create an account with your email on the <strong>Sign up</strong> page.</li>
          <li>Sign in anytime from <strong>Sign in</strong>. Your tournaments and saved teams stay linked to your account.</li>
          <li>Use <strong>Sign out</strong> in the sidebar when you are finished on a shared device.</li>
        </ol>
        <p className="guide-note">
          The app needs Supabase configured (see project README). If you see a configuration
          warning on the dashboard, contact your organizer or host before creating events.
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
          The <strong>Overview</strong> page lists every tournament on your account. Each card
          shows the format badge (League or Knockout), team count, last updated date, and whether
          the event is <strong>In play</strong>.
        </p>
        <ul className="guide-list">
          <li>
            <strong>+ New</strong> — creates a fresh tournament and opens setup.
          </li>
          <li>
            <strong>Open</strong> — tap the card to continue where you left off (setup, teams, or game).
          </li>
          <li>
            <strong>Delete</strong> — removes the tournament permanently (cannot be undone).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "saved-teams",
    title: "Saved teams (roster library)",
    content: (
      <>
        <p>
          Open <strong>Saved Teams</strong> in the sidebar to build a reusable roster for your account.
        </p>
        <ul className="guide-list">
          <li>Add team names once — they are stored on your profile.</li>
          <li>Rename or delete saved teams anytime.</li>
          <li>When setting up a tournament, tap saved team chips to add them quickly.</li>
          <li>You can still add one-off teams only for that event without saving them globally.</li>
        </ul>
        <p className="guide-note">
          Deleting a saved team does not remove it from tournaments already saved in the past.
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
          <li>From Overview, tap <strong>+ New</strong> (or <strong>Create tournament</strong> if you have none).</li>
          <li>
            <strong>Step 1 — Format:</strong> enter a tournament name, then choose{" "}
            <strong>League</strong> or <strong>Knockout</strong>. You cannot switch format after the
            competition has started without resetting.
          </li>
          <li>
            <strong>Step 2 — Teams:</strong> add at least two teams. Use saved chips or type new names.
            Rename or remove teams before you start the season or bracket.
          </li>
          <li>
            Tap <strong>Start league</strong> or <strong>Start knockout</strong> to enter the game view.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: "league",
    title: "League mode",
    content: (
      <>
        <p>After you start the league, fixtures are generated for every team pairing (home and away style round-robin).</p>
        <h4 className="guide-subtitle">Fixtures tab</h4>
        <ul className="guide-list">
          <li>Enter scores in the <strong>A</strong> and <strong>B</strong> fields for each match.</li>
          <li>Standings update automatically when both scores are filled.</li>
          <li>Win = 3 points, draw = 1 point each, loss = 0.</li>
        </ul>
        <h4 className="guide-subtitle">Standings tab</h4>
        <ul className="guide-list">
          <li>View played, won, draw, lost, and points for every team.</li>
          <li>Teams are sorted by wins, then losses.</li>
        </ul>
        <h4 className="guide-subtitle">League actions</h4>
        <ul className="guide-list">
          <li>
            <strong>Regenerate fixtures</strong> — clears all matches and builds a new schedule (scores are lost).
          </li>
          <li>
            <strong>Save screenshot</strong> — exports the current fixtures or standings view as a PNG.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "knockout",
    title: "Knockout mode",
    content: (
      <>
        <p>
          Tap <strong>Start knockout cup</strong> to build a full single-elimination bracket from your
          team list (byes are added automatically if the count is not a power of two).
        </p>
        <ul className="guide-list">
          <li>
            <strong>Pick winners</strong> — when both slots show real team names, tap a name to advance them.
          </li>
          <li>
            <strong>Waiting</strong> — matches fill in as earlier rounds finish.
          </li>
          <li>
            <strong>BYE</strong> — some teams skip a round; the other team advances automatically.
          </li>
          <li>
            <strong>Undo</strong> — on a finished match, use Undo to clear the winner and fix mistakes.
          </li>
          <li>
            <strong>Champion banner</strong> — appears when the final is decided.
          </li>
          <li>
            Swipe the bracket <strong>left and right</strong> on wide brackets; scroll the page up and down normally.
          </li>
          <li>
            <strong>Reset bracket</strong> — clears the knockout and lets you start again.
          </li>
          <li>
            <strong>Save screenshot</strong> — captures the bracket (and champion banner if shown).
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
        <p>On phone and tablet, the main area shows fixtures, table, or bracket. Extra tools live in the slide-out panel:</p>
        <ul className="guide-list">
          <li>
            <strong>Teams</strong> (bottom nav) — jump back to the team list step.
          </li>
          <li>
            <strong>Roster</strong> — open the side drawer to add, rename, or remove teams mid-event.
          </li>
          <li>
            <strong>Table</strong> (league) — quick switch to standings on mobile.
          </li>
          <li>
            <strong>Screenshot</strong> — export from the bottom bar or from the roster drawer.
          </li>
          <li>
            <strong>Reset all</strong> (in roster drawer) — wipes teams, matches, and bracket, then returns to format setup.
          </li>
        </ul>
        <p className="guide-note">
          On desktop, the teams roster stays in the left sidebar while the main panel shows the competition.
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
          <li>Changes save to the cloud as you work — watch for a brief <strong>Saving…</strong> indicator.</li>
          <li>Closing the browser or switching devices does not lose progress if you are signed in.</li>
          <li>Tournament name, format, teams, scores, and bracket state are all stored together per event.</li>
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
          <strong>Save screenshot</strong> downloads a high-quality PNG of the current export area — league
          fixtures, standings table, or knockout bracket. Use it for group chats, posters, or social posts.
        </p>
        <p className="guide-note">
          Start fixtures or the bracket before exporting; otherwise the app will ask you to begin the competition first.
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
          <li>Need a different format? Use <strong>Reset all</strong> or delete the tournament and create a new one.</li>
          <li>Format buttons are locked after matches or a bracket exist — this protects your live data.</li>
          <li>At least <strong>two teams</strong> are required before starting league or knockout.</li>
          <li>If something fails to save, check your connection and try again; error messages appear at the top.</li>
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
            From your first sign-in to crowning a champion — every step, explained with care.
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
