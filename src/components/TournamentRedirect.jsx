import { useEffect, useState } from "react";
import PageLoading from "./ui/PageLoading";
import { Link, Navigate, useParams } from "react-router-dom";
import { fetchTournament } from "../services/tournamentService";
import { isCustomMode } from "../lib/tournamentModes";
import { decodeFromDatabase } from "../lib/tournamentPersistence";

export default function TournamentRedirect() {
  const { id } = useParams();
  const [target, setTarget] = useState(null);
  const [error, setError] = useState("");

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
      } catch (err) {
        if (!cancelled) {
          const code = err?.code;
          if (code === "PGRST116" || err?.message?.includes("0 rows")) {
            setError("Tournament not found or you do not have access.");
          } else {
            setError(err.message || "Could not load tournament.");
          }
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="shared-fixtures shared-fixtures--error">
        <div className="shared-fixtures__card">
          <h1 className="shared-fixtures__title">Tournament unavailable</h1>
          <p className="shared-fixtures__message">{error}</p>
          <Link to="/" className="btn-action">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!target) {
    return <PageLoading message="Loading tournament…" />;
  }

  return <Navigate to={`/tournament/${id}/${target}`} replace />;
}
