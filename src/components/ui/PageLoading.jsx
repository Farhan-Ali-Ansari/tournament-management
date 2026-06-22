export default function PageLoading({ message = "Loading…", inline = false }) {
  return (
    <div
      className={`app-loading ${inline ? "app-loading--inline" : ""}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="app-loading__spinner" aria-hidden="true" />
      {message && <p className="app-loading__message">{message}</p>}
    </div>
  );
}
