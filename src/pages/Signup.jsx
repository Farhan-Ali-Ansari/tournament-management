import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { isSupabaseConfigured } from "../lib/supabase";
import { getAuthErrorMessage } from "../lib/authErrors";
import { getSupabaseConfigMessage } from "../lib/supabaseConfigMessage";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

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

      if (data?.session) {
        navigate("/", { replace: true });
        return;
      }

      if (data?.user) {
        setMessage("Account created! Check your email to confirm, then sign in.");
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
      subtitle="Organize leagues and knockout cups"
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
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
          label="Display name (optional)"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder=" "
        />
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          placeholder=" "
        />
        <Input
          floating
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder=" "
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={submitting || !isSupabaseConfigured}
        >
          {submitting ? "Creating…" : "Register"}
        </Button>
      </form>
    </AuthLayout>
  );
}
