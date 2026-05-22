import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { isSupabaseConfigured } from "../lib/supabase";
import { getAuthErrorMessage } from "../lib/authErrors";
import { getSupabaseConfigMessage } from "../lib/supabaseConfigMessage";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

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
      title=""
      subtitle="Made by Farhan"
      footer={
        <p>
          New here? <Link to="/signup">Create an account</Link>
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {!isSupabaseConfigured && (
          <div className="auth-form__alert auth-form__alert--error" role="alert">
            {getSupabaseConfigMessage()}
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
        <Input
          floating
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder=" "
        />
        <Input
          floating
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder=" "
        />
        <button type="button" className="auth-form__link-btn" onClick={handleForgot}>
          Forgot password?
        </button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="auth-form__submit"
          disabled={submitting || !isSupabaseConfigured}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
