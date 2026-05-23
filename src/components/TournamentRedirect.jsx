import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { fetchTournament } from "../services/tournamentService";
import { isCustomMode } from "../lib/tournamentModes";
import { decodeFromDatabase } from "../lib/tournamentPersistence";

export default function TournamentRedirect() {
  const { id } = useParams();
  const [target, setTarget] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const row = await fetchTournament(id);
        if (cancelled) return;
        const decoded = decodeFromDatabase(row);
        const mode = decoded.mode;
        const hasName = Boolean(decoded.name?.trim());
        const hasLeague = decoded.matches.length > 0;
        const hasKnockout = decoded.knockout_rounds.length > 0;
        const teamCount = decoded.teams.length;

        if (!hasName) setTarget("setup");
        else if (hasLeague || hasKnockout) setTarget("game");
        else if (teamCount >= 2) setTarget(isCustomMode(mode) ? "game" : "teams");
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
