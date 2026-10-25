import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import { SectionFoundation } from "@/components/experience/SectionFoundation";

export const Route = createFileRoute("/espace")({
  head: () => ({
    meta: [
      { title: "Espace — Écosystème" },
      { name: "description", content: "Votre espace personnel." },
    ],
  }),
  component: () => (
    <SectionFoundation
      eyebrowKey="page.espace.eyebrow"
      titleKey="page.espace.title"
      descKey="page.espace.desc"
      tone="primary"
      icon={User}
      sections={[
        { key: "you", titleKey: "page.espace.section.you", perf: "short" },
        { key: "circles", titleKey: "page.espace.section.circles", perf: "tall" },
      ]}
      footer="Foundation · Espace"
    />
  ),
});
