import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { isSupabaseConfigured } from "../lib/supabase";
import { getAuthErrorMessage } from "../lib/authErrors";

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await signUp(email.trim(), password, displayName.trim());

      // No email confirm (Supabase setting): session is returned → go straight in
      if (data?.session) {
        navigate("/", { replace: true });
        return;
      }

      // Email confirm still enabled in Supabase: user created but must verify inbox
      if (data?.user) {
        setMessage(
          "Account created! Check your email to confirm, then sign in."
        );
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start managing leagues and knockouts"
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
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
          <span>Name (optional)</span>
          <input
            type="text"
            autoComplete="name"
            placeholder="Farhan"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>
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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        <label className="auth-form__field">
          <span>Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button
          type="submit"
          className="btn-primary-large auth-form__submit"
          disabled={submitting || !isSupabaseConfigured}
        >
          {submitting ? "Creating…" : "Sign up"}
        </button>
      </form>
    </AuthLayout>
  );
}
