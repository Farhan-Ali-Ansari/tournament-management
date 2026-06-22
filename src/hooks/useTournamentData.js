import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTournament, updateTournament } from "../services/tournamentService";
import { MODES } from "../lib/tournamentModes";
import { decodeFromDatabase, encodeForDatabase } from "../lib/tournamentPersistence";
import {
  getTournamentErrorMessage,
  isModeConstraintError,
} from "../lib/tournamentErrors";

const SAVE_DEBOUNCE_MS = 800;

export function useTournamentData(tournamentId) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveError, setSaveError] = useState("");
  const [modeSetupRequired, setModeSetupRequired] = useState(false);
  const [shareEnabled, setShareEnabled] = useState(false);
  const [tournamentName, setTournamentName] = useState("");
  const [teams, setTeams] = useState([]);
  const [mode, setMode] = useState(MODES.LEAGUE);
  const [matches, setMatches] = useState([]);
  const [knockoutRounds, setKnockoutRounds] = useState([]);
  const saveTimer = useRef(null);
  const readyToSave = useRef(false);
  const latestState = useRef({});

  useEffect(() => {
    if (!tournamentId) return;
    let cancelled = false;
    readyToSave.current = false;

    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const row = await fetchTournament(tournamentId);
        if (cancelled) return;
        const decoded = decodeFromDatabase(row);
        setTournamentName(decoded.name);
        setTeams(decoded.teams);
        setMode(decoded.mode);
        setMatches(decoded.matches);
        setKnockoutRounds(decoded.knockout_rounds);
        setShareEnabled(Boolean(row.share_enabled));
      } catch (err) {
        if (!cancelled) {
          const code = err?.code;
          if (code === "PGRST116" || err?.message?.includes("0 rows")) {
            setLoadError("Tournament not found or you do not have access.");
          } else {
            setLoadError(err.message || "Failed to load tournament");
          }
        }
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
      setSaveStatus("saving");
      setSaveError("");
      setModeSetupRequired(false);
      try {
        await updateTournament(tournamentId, encodeForDatabase(appState));
        setSaveStatus("saved");
        setTimeout(() => {
          setSaveStatus((s) => (s === "saved" ? "idle" : s));
        }, 2000);
      } catch (err) {
        setSaveStatus("error");
        const msg = getTournamentErrorMessage(err);
        setSaveError(msg);
        setModeSetupRequired(isModeConstraintError(err));
      }
    },
    [tournamentId]
  );

  const scheduleSave = useCallback(
    (appState) => {
      latestState.current = appState;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(appState), SAVE_DEBOUNCE_MS);
    },
    [persist]
  );

  const retrySave = useCallback(() => {
    if (latestState.current && Object.keys(latestState.current).length) {
      persist(latestState.current);
    }
  }, [persist]);

  useEffect(() => {
    if (loading || !readyToSave.current) return;
    const appState = {
      name: tournamentName,
      mode,
      teams,
      matches,
      knockout_rounds: knockoutRounds,
    };
    latestState.current = appState;
    scheduleSave(appState);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [loading, tournamentName, mode, teams, matches, knockoutRounds, scheduleSave]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      const pending = latestState.current;
      if (tournamentId && readyToSave.current && pending && Object.keys(pending).length) {
        void updateTournament(tournamentId, encodeForDatabase(pending));
      }
    };
  }, [tournamentId]);

  return {
    loading,
    loadError,
    saveStatus,
    saveError,
    modeSetupRequired,
    shareEnabled,
    setShareEnabled,
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
    retrySave,
  };
}
