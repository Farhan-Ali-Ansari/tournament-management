/** Gold circular close control — pass `className` for positioning (e.g. finish-scene__close). */
export default function CloseIconButton({
  className = "",
  size = 20,
  label = "Close",
  ...props
}) {
  return (
    <button
      type="button"
      className={`icon-btn icon-btn--close ${className}`.trim()}
      aria-label={label}
      {...props}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
        <path
          d="M18 6L6 18M6 6l12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
