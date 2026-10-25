import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n/useI18n";
import { authService } from "../services/auth.service";

type Mode = "signIn" | "signUp" | "forgot";

/** Sign-in / sign-up / password-reset doorway. Public route: no gate, no redirect loop. */
export function SignInView() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    if (mode === "forgot") {
      const { error } = await authService.requestPasswordReset(email);
      setBusy(false);
      setMessage(error ? error.message : t("auth.resetSent"));
      return;
    }

    const result =
      mode === "signIn"
        ? await authService.signIn(email, password)
        : await authService.signUp(email, password);

    setBusy(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    if (result.data.session) {
      void navigate({ to: "/" });
      return;
    }
    setMessage(t("auth.checkEmail"));
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t(mode === "forgot" ? "auth.forgotTitle" : "auth.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(mode === "forgot" ? "auth.forgotSubtitle" : "auth.subtitle")}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <label className="block text-sm">
            <span className="text-muted-foreground">{t("auth.email")}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border/60 bg-card/40 px-3 py-2 outline-none focus:border-primary"
            />
          </label>

          {mode !== "forgot" ? (
            <label className="block text-sm">
              <span className="text-muted-foreground">{t("auth.password")}</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-border/60 bg-card/40 px-3 py-2 outline-none focus:border-primary"
              />
            </label>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy
              ? t("app.loading")
              : t(
                  mode === "signIn"
                    ? "auth.signIn"
                    : mode === "signUp"
                      ? "auth.signUp"
                      : "auth.sendReset",
                )}
          </button>
        </form>

        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}

        <div className="mt-5 flex flex-col items-center gap-2 text-sm">
          {mode === "signIn" ? (
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setMessage(null);
              }}
              className="text-muted-foreground underline-offset-4 hover:underline"
            >
              {t("auth.forgot")}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signIn" ? "signUp" : "signIn");
              setMessage(null);
            }}
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            {t(mode === "signIn" ? "auth.toSignUp" : "auth.toSignIn")}
          </button>
        </div>
      </div>
    </div>
  );
}
