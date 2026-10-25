import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n/useI18n";
import { authService } from "../services/auth.service";

/**
 * Password reset landing page. Public route reached from the recovery email
 * link; the recovery session lets updateUser set the new password.
 */
export function ResetPasswordView() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setMessage(t("auth.passwordMismatch"));
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await authService.updatePassword(password);
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    void navigate({ to: "/" });
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{t("auth.resetTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.resetSubtitle")}</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="text-muted-foreground">{t("auth.newPassword")}</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border/60 bg-card/40 px-3 py-2 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">{t("auth.confirmPassword")}</span>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border/60 bg-card/40 px-3 py-2 outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? t("app.loading") : t("auth.resetSubmit")}
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}
