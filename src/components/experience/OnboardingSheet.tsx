import { Sheet } from "@/components/app/Sheet";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/experience/onboarding";
import { useI18n } from "@/lib/i18n/useI18n";

/**
 * OnboardingSheet — minimal welcome shell.
 * Appears once per device. Real flow steps land later; surface stays stable.
 */
export function OnboardingSheet() {
  const { t } = useI18n();
  const shouldShow = useOnboarding((s) => s.shouldShow);
  const hydrated = useOnboarding((s) => s.hydrated);
  const dismiss = useOnboarding((s) => s.dismiss);
  const markCompleted = useOnboarding((s) => s.markCompleted);

  if (!hydrated) return null;

  return (
    <Sheet
      open={shouldShow}
      onOpenChange={(o) => !o && dismiss()}
      title={t("onboarding.title")}
      description={t("onboarding.desc")}
    >
      <div className="space-y-4 pt-2">
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary text-xs font-medium">
              1
            </span>
            <span>{t("home.section.flash")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary text-xs font-medium">
              2
            </span>
            <span>{t("home.section.radar")}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary text-xs font-medium">
              3
            </span>
            <span>{t("home.section.discovery")}</span>
          </li>
        </ol>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={dismiss}>
            {t("onboarding.skip")}
          </Button>
          <Button onClick={markCompleted}>{t("onboarding.start")}</Button>
        </div>
      </div>
    </Sheet>
  );
}
