import { supabase } from "../lib/supabase";

export async function fetchSavedTeams(userId) {
  const { data, error } = await supabase
    .from("saved_teams")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createSavedTeam(userId, name) {
  const trimmed = name.trim();
  const { data, error } = await supabase
    .from("saved_teams")
    .insert({ user_id: userId, name: trimmed })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSavedTeam(id, name) {
  const { data, error } = await supabase
    .from("saved_teams")
    .update({ name: name.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSavedTeam(id) {
  const { error } = await supabase.from("saved_teams").delete().eq("id", id);
  if (error) throw error;
}
