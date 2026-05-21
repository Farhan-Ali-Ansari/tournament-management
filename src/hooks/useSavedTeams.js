import { useCallback, useEffect, useState } from "react";
import {
  createSavedTeam,
  deleteSavedTeam,
  fetchSavedTeams,
  updateSavedTeam,
} from "../services/savedTeamsService";

export function useSavedTeams(userId) {
  const [savedTeams, setSavedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchSavedTeams(userId);
      setSavedTeams(list);
    } catch (err) {
      setError(err.message || "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const addSavedTeam = async (name) => {
    const row = await createSavedTeam(userId, name);
    setSavedTeams((prev) =>
      [...prev, row].sort((a, b) => a.name.localeCompare(b.name))
    );
    return row;
  };

  const renameSavedTeam = async (id, newName) => {
    const row = await updateSavedTeam(id, newName);
    setSavedTeams((prev) =>
      prev
        .map((t) => (t.id === id ? row : t))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    return row;
  };

  const removeSavedTeam = async (id) => {
    await deleteSavedTeam(id);
    setSavedTeams((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    savedTeams,
    loading,
    error,
    setError,
    reload: load,
    addSavedTeam,
    renameSavedTeam,
    removeSavedTeam,
  };
}
