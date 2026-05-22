export default function Badge({ children, variant = "outline", className = "" }) {
  return (
    <span className={["ui-badge", `ui-badge--${variant}`, className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}
