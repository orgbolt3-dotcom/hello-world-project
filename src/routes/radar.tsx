import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { SectionFoundation } from "@/components/experience/SectionFoundation";

export const Route = createFileRoute("/radar")({
  head: () => ({
    meta: [
      { title: "Radar — Écosystème" },
      { name: "description", content: "Ce qui se passe autour de vous." },
      { property: "og:title", content: "Radar — Écosystème" },
      { property: "og:description", content: "Ce qui se passe autour de vous." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <SectionFoundation
      eyebrowKey="page.radar.eyebrow"
      titleKey="page.radar.title"
      descKey="page.radar.desc"
      tone="info"
      icon={MapPin}
      sections={[
        { key: "near", titleKey: "page.radar.section.near", perf: "short" },
        { key: "area", titleKey: "page.radar.section.area", perf: "tall" },
      ]}
      footer="Foundation · Radar"
    />
  ),
});
