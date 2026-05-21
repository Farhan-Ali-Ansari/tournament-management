import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { isSupabaseConfigured } from "../lib/supabase";
import { getAuthErrorMessage } from "../lib/authErrors";

export default function Login() {
  const { signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async () => {
    if (!email.trim()) {
      setError("Enter your email first, then tap Forgot password.");
      return;
    }
    setError("");
    setMessage("");
    try {
      await resetPassword(email.trim());
      setMessage("Check your email for a password reset link.");
    } catch (err) {
      setError(err.message || "Could not send reset email");
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your tournaments"
      footer={
        <p>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {!isSupabaseConfigured && (
          <div className="auth-form__alert auth-form__alert--error" role="alert">
            Missing <code>.env.local</code>. Copy <code>.env.example</code>, add your Supabase
            URL and key, then run <code>npm start</code> again.
          </div>
        )}
        {error && (
          <div className="auth-form__alert auth-form__alert--error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="auth-form__alert auth-form__alert--success" role="status">
            {message}
          </div>
        )}
        <label className="auth-form__field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="auth-form__field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button
          type="button"
          className="auth-form__link-btn"
          onClick={handleForgot}
        >
          Forgot password?
        </button>
        <button
          type="submit"
          className="btn-primary-large auth-form__submit"
          disabled={submitting || !isSupabaseConfigured}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
