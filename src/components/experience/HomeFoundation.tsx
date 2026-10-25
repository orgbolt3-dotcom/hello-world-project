import { useEffect, useState, type ReactNode } from "react";
import { Surface } from "@/components/app/Surface";
import { Indicator } from "@/components/app/Indicator";
import { EmptyState } from "@/components/app/EmptyState";
import { getDiscoverySections, type DiscoverySection } from "@/lib/experience/discovery";
import { useI18n } from "@/lib/i18n/useI18n";
import { useIdentity } from "@/lib/experience/identity";

function Section({
  title,
  children,
  perf = "auto",
}: {
  title: ReactNode;
  children: ReactNode;
  /** content-visibility hint — keeps offscreen sections cheap. */
  perf?: "auto" | "short" | "tall" | "none";
}) {
  const cv =
    perf === "short" ? "cv-short" : perf === "tall" ? "cv-tall" : perf === "none" ? "" : "cv-auto";
  return (
    <section className={`stack-3 ${cv}`.trim()}>
      <h2 className="text-caption font-medium tracking-tight text-foreground/80">{title}</h2>
      {children}
    </section>
  );
}

/**
 * HomeFoundation — orchestrates the home experience.
 *
 * It does NOT implement any domain. It exposes 4 calm slots (Flash,
 * Radar, Feed, Discovery) where domains plug in via registries.
 * Empty by default = calm by default.
 *
 * Phase 5/5: harmonized typography (semantic utilities), responsive
 * page-shell, content-visibility on offscreen sections.
 */
export function HomeFoundation() {
  const { t } = useI18n();
  const tier = useIdentity((s) => s.tier);

  // Resolve discovery sections client-side so registrations land in time.
  const [sections, setSections] = useState<DiscoverySection[]>([]);
  useEffect(() => {
    setSections(getDiscoverySections());
  }, []);

  const identityLabel =
    tier === "trusted"
      ? t("identity.trusted")
      : tier === "identified"
        ? t("identity.identified")
        : t("identity.guest");

  return (
    <div className="page-shell stack-10">
      <header className="stack-2 motion-rise-in">
        <Indicator tone="primary" label={identityLabel} dot />
        <h1 className="text-fluid-display-sm">{t("home.welcome")}</h1>
        <p className="text-subtitle max-w-prose">{t("home.subtitle")}</p>
      </header>

      <Section title={t("home.section.flash")} perf="short">
        <Surface variant="sunken" padding="lg" bordered>
          <EmptyState title={t("common.empty")} description={t("common.empty.desc")} />
        </Surface>
      </Section>

      <Section title={t("home.section.radar")} perf="short">
        <Surface variant="sunken" padding="lg" bordered>
          <EmptyState title={t("common.empty")} description={t("common.empty.desc")} />
        </Surface>
      </Section>

      <Section title={t("home.section.feed")} perf="tall">
        <Surface variant="sunken" padding="lg" bordered>
          <EmptyState title={t("common.empty")} description={t("common.empty.desc")} />
        </Surface>
      </Section>

      <Section title={t("home.section.discovery")} perf="tall">
        {sections.length === 0 ? (
          <Surface variant="sunken" padding="lg" bordered>
            <EmptyState title={t("common.empty")} description={t("common.empty.desc")} />
          </Surface>
        ) : (
          <div className="stack-3">
            {sections.map((s) => (
              <div key={s.key}>{s.render()}</div>
            ))}
          </div>
        )}
      </Section>

      <footer className="pt-4 pb-2 text-center text-meta">Phase 5 · Experience Foundation</footer>
    </div>
  );
}
