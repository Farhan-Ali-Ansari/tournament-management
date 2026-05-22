export default function Card({
  children,
  className = "",
  as: Tag = "div",
  glass = true,
  hover = true,
  ...props
}) {
  const classes = [
    "ui-card",
    glass && "ui-card--glass",
    hover && "ui-card--hover",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}
