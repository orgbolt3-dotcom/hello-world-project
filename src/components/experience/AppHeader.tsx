import { Link } from "@tanstack/react-router";
import { Bell, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/useI18n";
import { signOut, useAuth } from "@/domains/auth";

export function AppHeader({ onOpenCommunication }: { onOpenCommunication: () => void }) {
  const { t } = useI18n();
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 border-b border-border-soft bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-screen-md items-center justify-between px-4">
        <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="icon">
            <Link to="/espace" aria-label={t("profile.open")}>
              <UserRound aria-hidden />
            </Link>
          </Button>
          {user ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t("auth.signOut")}
              onClick={() => void signOut().then(() => window.location.assign("/"))}
            >
              <LogOut aria-hidden />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onOpenCommunication}
            aria-label={t("communication.open")}
          >
            <Bell aria-hidden />
          </Button>
        </div>
      </div>
    </header>
  );
}
