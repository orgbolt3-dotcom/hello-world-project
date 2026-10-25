import { createFileRoute } from "@tanstack/react-router";
import { HomeFoundation } from "@/components/experience/HomeFoundation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Écosystème — Vivant, calme, intelligent" },
      {
        name: "description",
        content:
          "Un écosystème vivant qui relie les personnes, les talents et les opportunités, avec calme et intelligence.",
      },
      { property: "og:title", content: "Écosystème — Vivant, calme, intelligent" },
      {
        property: "og:description",
        content: "Foundation — orchestration globale, calme et vivante.",
      },
    ],
  }),
  component: HomeFoundation,
});
