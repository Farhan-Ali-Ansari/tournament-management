export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__brand">
          <span className="auth-page__logo" aria-hidden="true">
            🏆
          </span>
          <h1 className="auth-page__title">{title}</h1>
          {subtitle && <p className="auth-page__subtitle">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="auth-page__footer">{footer}</div>}
      </div>
    </div>
  );
}
