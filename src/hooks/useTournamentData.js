import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTournament, updateTournament } from "../services/tournamentService";

const SAVE_DEBOUNCE_MS = 800;

export function useTournamentData(tournamentId) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tournamentName, setTournamentName] = useState("My Tournament");
  const [teams, setTeams] = useState([]);
  const [mode, setMode] = useState("league");
  const [matches, setMatches] = useState([]);
  const [knockoutRounds, setKnockoutRounds] = useState([]);
  const saveTimer = useRef(null);
  const readyToSave = useRef(false);

  useEffect(() => {
    if (!tournamentId) return;
    let cancelled = false;
    readyToSave.current = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const row = await fetchTournament(tournamentId);
        if (cancelled) return;
        setTournamentName(row.name ?? "My Tournament");
        setTeams(Array.isArray(row.teams) ? row.teams : []);
        setMode(row.mode === "knockout" ? "knockout" : "league");
        setMatches(Array.isArray(row.matches) ? row.matches : []);
        setKnockoutRounds(
          Array.isArray(row.knockout_rounds) ? row.knockout_rounds : []
        );
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load tournament");
      } finally {
        if (!cancelled) {
          setLoading(false);
          readyToSave.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
      readyToSave.current = false;
    };
  }, [tournamentId]);

  const persist = useCallback(
    async (payload) => {
      if (!tournamentId || !readyToSave.current) return;
      setSaving(true);
      try {
        await updateTournament(tournamentId, payload);
      } catch (err) {
        setError(err.message || "Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [tournamentId]
  );

  const scheduleSave = useCallback(
    (payload) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(payload), SAVE_DEBOUNCE_MS);
    },
    [persist]
  );

  useEffect(() => {
    if (loading || !readyToSave.current) return;
    scheduleSave({
      name: tournamentName,
      mode,
      teams,
      matches,
      knockout_rounds: knockoutRounds,
    });
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [
    loading,
    tournamentName,
    mode,
    teams,
    matches,
    knockoutRounds,
    scheduleSave,
  ]);

  return {
    loading,
    saving,
    error,
    setError,
    tournamentName,
    setTournamentName,
    teams,
    setTeams,
    matches,
    setMatches,
    mode,
    setMode,
    knockoutRounds,
    setKnockoutRounds,
    persist,
  };
}
