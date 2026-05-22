import { isSupabaseConfigured } from "./supabase";

export function getAuthErrorMessage(err) {
  if (!isSupabaseConfigured) {
    return process.env.NODE_ENV === "production"
      ? "Supabase is not configured for this deployment. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel (or .env.production), then redeploy."
      : "Supabase is not configured. Copy .env.example to .env.local, add your keys, then restart npm start.";
  }

  const msg = err?.message || "";

  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "Cannot reach Supabase. Check your internet, project URL in .env.local, and restart the dev server after changing env files.";
  }

  if (/permission denied for table tournaments/i.test(msg)) {
    return "Database permissions missing. In Supabase SQL Editor, run supabase/fix-permissions.sql, then refresh this page.";
  }

  if (/permission denied for table saved_teams/i.test(msg)) {
    return "Saved teams table needs setup. Run supabase/saved-teams.sql in Supabase SQL Editor, then refresh.";
  }

  if (/saved_teams|relation.*does not exist/i.test(msg)) {
    return "Run supabase/saved-teams.sql in Supabase SQL Editor to enable account team memory.";
  }

  if (/email not confirmed|confirm your email/i.test(msg)) {
    return "Email confirmation is still required in Supabase. Turn OFF “Confirm email” under Authentication → Providers → Email, or confirm the user in Authentication → Users.";
  }

  if (/email rate limit exceeded/i.test(msg)) {
    return "Too many sign-up emails sent. Wait about an hour, or turn OFF “Confirm email” in Supabase to send fewer emails.";
  }

  return msg || "Something went wrong. Please try again.";
}
