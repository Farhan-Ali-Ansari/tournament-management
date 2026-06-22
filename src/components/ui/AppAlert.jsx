export default function AppAlert({ variant = "error", children, className = "", ...props }) {
  return (
    <div
      className={`auth-form__alert auth-form__alert--${variant} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
