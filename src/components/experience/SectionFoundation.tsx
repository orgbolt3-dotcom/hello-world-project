import type { ComponentType, ReactNode } from "react";
import { Surface } from "@/components/app/Surface";
import { Indicator } from "@/components/app/Indicator";
import { EmptyState } from "@/components/app/EmptyState";
import { Icon } from "@/components/app/Icon";
import { useI18n } from "@/lib/i18n/useI18n";
import type { MessageKey } from "@/lib/i18n/messages";

type Tone = "primary" | "warning" | "info" | "intelligence" | "neutral";

export interface SectionSlot {
  key: string;
  titleKey: MessageKey;
  perf?: "auto" | "short" | "tall" | "none";
  /** Optional custom body — falls back to EmptyState. */
  render?: () => ReactNode;
}

interface SectionFoundationProps {
  eyebrowKey: MessageKey;
  titleKey: MessageKey;
  descKey: MessageKey;
  tone?: Tone;
  icon?: ComponentType<{ className?: string }>;
  sections?: SectionSlot[];
  /** Footer label, e.g. "Foundation · Flash". */
  footer?: ReactNode;
}

function cvClass(perf: SectionSlot["perf"]) {
  switch (perf) {
    case "short":
      return "cv-short";
    case "tall":
      return "cv-tall";
    case "none":
      return "";
    default:
      return "cv-auto";
  }
}

/**
 * SectionFoundation — generic, domain-agnostic page shell for the
 * Flash / Radar / Espace / Talents screens. Same comb as HomeFoundation:
 * page-shell, semantic fluid typography, content-visibility on
 * offscreen sections, calm empty-by-default state.
 */
export function SectionFoundation({
  eyebrowKey,
  titleKey,
  descKey,
  tone = "primary",
  icon,
  sections = [],
  footer,
}: SectionFoundationProps) {
  const { t } = useI18n();
  return (
    <div className="page-shell stack-10">
      <header className="stack-2 motion-rise-in">
        <Indicator
          tone={tone}
          dot
          label={
            <span className="inline-flex items-center gap-1.5">
              {icon ? <Icon as={icon} size="xs" /> : null}
              {t(eyebrowKey)}
            </span>
          }
        />
        <h1 className="text-fluid-display-sm">{t(titleKey)}</h1>
        <p className="text-subtitle max-w-prose">{t(descKey)}</p>
      </header>

      {sections.map((s) => (
        <section key={s.key} className={`stack-3 ${cvClass(s.perf)}`.trim()}>
          <h2 className="text-caption font-medium tracking-tight text-foreground/80">
            {t(s.titleKey)}
          </h2>
          {s.render ? (
            s.render()
          ) : (
            <Surface variant="sunken" padding="lg" bordered>
              <EmptyState title={t("common.empty")} description={t("common.empty.desc")} />
            </Surface>
          )}
        </section>
      ))}

      {footer ? <footer className="pt-4 pb-2 text-center text-meta">{footer}</footer> : null}
    </div>
  );
}
