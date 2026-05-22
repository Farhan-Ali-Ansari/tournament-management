import { useEffect } from "react";

/** Fade + slide-up page entrance (CSS-driven). */
export default function PageShell({ children, className = "" }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <div className={`page-shell page-enter ${className}`.trim()}>{children}</div>;
}
