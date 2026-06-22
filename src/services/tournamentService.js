import { supabase } from "../lib/supabase";
import { decodeFromDatabase, encodeForDatabase } from "../lib/tournamentPersistence";

export async function fetchTournaments(userId) {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchTournament(id) {
  const { data, error } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/** Public share page — prefers restricted view when available. */
export async function fetchSharedTournament(id) {
  const { data, error } = await supabase
    .from("shared_tournaments")
    .select("id, name, mode, teams, matches, knockout_rounds, share_enabled, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (!error && data) return data;

  const fallback = await supabase
    .from("tournaments")
    .select("id, name, mode, teams, matches, knockout_rounds, share_enabled, updated_at")
    .eq("id", id)
    .eq("share_enabled", true)
    .maybeSingle();

  if (fallback.error) throw fallback.error;
  if (!fallback.data) throw new Error("Tournament not found or sharing is disabled.");
  return fallback.data;
}

export async function createTournament(userId, name = "") {
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      user_id: userId,
      name,
      mode: "league",
      teams: [],
      matches: [],
      knockout_rounds: [],
      share_enabled: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function duplicateTournament(userId, sourceId) {
  const source = await fetchTournament(sourceId);
  const decoded = decodeFromDatabase(source);
  const payload = encodeForDatabase({
    name: `${decoded.name || "Tournament"} (copy)`.trim(),
    mode: decoded.mode,
    teams: decoded.teams,
    matches: decoded.matches,
    knockout_rounds: decoded.knockout_rounds,
  });

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      user_id: userId,
      ...payload,
      share_enabled: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTournament(id, payload) {
  const { data, error } = await supabase
    .from("tournaments")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function renameTournament(id, name) {
  return updateTournament(id, { name: name.trim() });
}

export async function deleteTournament(id) {
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw error;
}

export async function enableTournamentSharing(id) {
  const { data, error } = await supabase
    .from("tournaments")
    .update({ share_enabled: true })
    .eq("id", id)
    .select("id, share_enabled")
    .single();

  if (error) throw error;
  return data;
}

export async function disableTournamentSharing(id) {
  const { data, error } = await supabase
    .from("tournaments")
    .update({ share_enabled: false })
    .eq("id", id)
    .select("id, share_enabled")
    .single();

  if (error) throw error;
  return data;
}
