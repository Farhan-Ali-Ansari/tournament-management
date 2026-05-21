import { supabase } from "../lib/supabase";

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

export async function createTournament(userId, name = "My Tournament") {
  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      user_id: userId,
      name,
      mode: "league",
      teams: [],
      matches: [],
      knockout_rounds: [],
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

export async function deleteTournament(id) {
  const { error } = await supabase.from("tournaments").delete().eq("id", id);
  if (error) throw error;
}
