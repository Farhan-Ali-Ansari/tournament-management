export default function SaveStatusIndicator({ status, onRetry }) {
  if (status === "saving") {
    return <p className="save-indicator save-indicator--header">Saving…</p>;
  }
  if (status === "saved") {
    return (
      <p className="save-indicator save-indicator--header save-indicator--saved">
        Saved
      </p>
    );
  }
  if (status === "error") {
    return (
      <p className="save-indicator save-indicator--header save-indicator--error">
        Save failed{" "}
        {onRetry && (
          <button type="button" className="btn-text save-indicator__retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </p>
    );
  }
  return null;
}
