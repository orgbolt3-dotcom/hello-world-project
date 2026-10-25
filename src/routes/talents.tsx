import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SectionFoundation } from "@/components/experience/SectionFoundation";

export const Route = createFileRoute("/talents")({
  head: () => ({
    meta: [
      { title: "Talents — Savoirs Vivants" },
      { name: "description", content: "Connaissances vivantes, échanges humains." },
    ],
  }),
  component: () => (
    <SectionFoundation
      eyebrowKey="page.talents.eyebrow"
      titleKey="page.talents.title"
      descKey="page.talents.desc"
      tone="intelligence"
      icon={Sparkles}
      sections={[
        { key: "offer", titleKey: "page.talents.section.offer", perf: "short" },
        { key: "seek", titleKey: "page.talents.section.seek", perf: "tall" },
      ]}
      footer="Foundation · Talents"
    />
  ),
});
