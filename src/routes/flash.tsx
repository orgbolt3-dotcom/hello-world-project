import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { SectionFoundation } from "@/components/experience/SectionFoundation";

export const Route = createFileRoute("/flash")({
  head: () => ({
    meta: [
      { title: "Flash — Écosystème" },
      { name: "description", content: "Moments éphémères de l'écosystème." },
    ],
  }),
  component: () => (
    <SectionFoundation
      eyebrowKey="page.flash.eyebrow"
      titleKey="page.flash.title"
      descKey="page.flash.desc"
      tone="warning"
      icon={Zap}
      sections={[
        { key: "now", titleKey: "page.flash.section.now", perf: "short" },
        { key: "soon", titleKey: "page.flash.section.soon", perf: "tall" },
      ]}
      footer="Foundation · Flash"
    />
  ),
});
