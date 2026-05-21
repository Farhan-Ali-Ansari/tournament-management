import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { fetchTournament } from "../services/tournamentService";

export default function TournamentRedirect() {
  const { id } = useParams();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const row = await fetchTournament(id);
        if (cancelled) return;
        const hasLeague = Array.isArray(row.matches) && row.matches.length > 0;
        const hasKnockout =
          Array.isArray(row.knockout_rounds) && row.knockout_rounds.length > 0;
        const teamCount = Array.isArray(row.teams) ? row.teams.length : 0;

        if (hasLeague || hasKnockout) setTarget("game");
        else if (teamCount >= 2) setTarget("teams");
        else setTarget("setup");
      } catch {
        if (!cancelled) setTarget("setup");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!target) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" aria-hidden="true" />
        <p>Loading…</p>
      </div>
    );
  }

  return <Navigate to={`/tournament/${id}/${target}`} replace />;
}
