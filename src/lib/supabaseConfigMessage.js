/** User-facing hint when Supabase env vars are missing at build time. */
export function getSupabaseConfigMessage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <>
        Supabase is not configured for this deployment. In your Vercel project, add{" "}
        <code>REACT_APP_SUPABASE_URL</code> and <code>REACT_APP_SUPABASE_ANON_KEY</code>{" "}
        (from Supabase → Settings → API), then redeploy. Or commit them in{" "}
        <code>.env.production</code> and push again.
      </>
    );
  }

  return (
    <>
      Missing <code>.env.local</code>. Copy <code>.env.example</code>, add your Supabase URL
      and key, then run <code>npm start</code> again.
    </>
  );
}
