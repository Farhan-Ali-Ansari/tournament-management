import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTournament, updateTournament } from "../services/tournamentService";
import { MODES } from "../lib/tournamentModes";
import { decodeFromDatabase, encodeForDatabase } from "../lib/tournamentPersistence";

const SAVE_DEBOUNCE_MS = 800;

export function useTournamentData(tournamentId) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tournamentName, setTournamentName] = useState("");
  const [teams, setTeams] = useState([]);
  const [mode, setMode] = useState(MODES.LEAGUE);
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
        const decoded = decodeFromDatabase(row);
        setTournamentName(decoded.name);
        setTeams(decoded.teams);
        setMode(decoded.mode);
        setMatches(decoded.matches);
        setKnockoutRounds(decoded.knockout_rounds);
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
    async (appState) => {
      if (!tournamentId || !readyToSave.current) return;
      setSaving(true);
      try {
        await updateTournament(tournamentId, encodeForDatabase(appState));
      } catch (err) {
        setError(err.message || "Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [tournamentId]
  );

  const scheduleSave = useCallback(
    (appState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(appState), SAVE_DEBOUNCE_MS);
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
