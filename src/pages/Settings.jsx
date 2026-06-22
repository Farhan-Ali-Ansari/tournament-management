import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import AppAlert from "../components/ui/AppAlert";
import { getAuthErrorMessage } from "../lib/authErrors";

export default function Settings() {
  const { user, updateProfile, updatePassword } = useAuth();
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || ""
  );
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSavingProfile(true);
    try {
      await updateProfile({ display_name: displayName.trim() });
      setMessage("Profile updated.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setMessage("");
    setSavingPassword(true);
    try {
      await updatePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout title="Account settings" subtitle="Profile & security">
      {error && <AppAlert role="alert">{error}</AppAlert>}
      {message && (
        <AppAlert variant="success" role="status">
          {message}
        </AppAlert>
      )}

      <section className="settings-section ui-card">
        <h2 className="section-title">Profile</h2>
        <p className="settings-section__email">{user?.email}</p>
        <form className="auth-form settings-form" onSubmit={handleProfile}>
          <Input
            floating
            label="Display name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder=" "
          />
          <Button type="submit" variant="primary" disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </section>

      <section className="settings-section ui-card">
        <h2 className="section-title">Change password</h2>
        <form className="auth-form settings-form" onSubmit={handlePassword}>
          <Input
            floating
            label="New password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder=" "
          />
          <Input
            floating
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder=" "
          />
          <Button type="submit" variant="primary" disabled={savingPassword}>
            {savingPassword ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>
    </DashboardLayout>
  );
}
