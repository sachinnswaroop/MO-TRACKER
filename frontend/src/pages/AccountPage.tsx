import { useState, type FormEvent } from "react";
import { apiPost, ApiError } from "../lib/api";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Field, Input } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";

export function AccountPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      await apiPost("/api/change-password", { old_password: oldPassword, new_password: newPassword });
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to change password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Account" subtitle="Change your password" />
      <Card className="max-w-lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Current Password">
            <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
          </Field>
          <Field label="New Password">
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={4} />
          </Field>
          <Button type="submit" variant="primary" disabled={busy}>
            Change Password
          </Button>
          {error && <Alert>{error}</Alert>}
          {success && <Alert variant="success">Password changed successfully.</Alert>}
        </form>
      </Card>
    </div>
  );
}
