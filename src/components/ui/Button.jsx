export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}) {
  const classes = [
    "ui-btn",
    `ui-btn--${variant}`,
    size === "lg" && "ui-btn--lg",
    size === "sm" && "ui-btn--sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
