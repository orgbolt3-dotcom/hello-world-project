import { createFileRoute } from "@tanstack/react-router";
import { ScanView } from "@/domains/scan/ui/ScanView";

export const Route = createFileRoute("/scan")({
  head: () => ({ meta: [
    { title: "Scan — Recherche immédiate | Vitala" },
    { name: "description", content: "Recherchez volontairement des Flashs selon vos critères, sans surveillance automatique et dans le respect de votre confidentialité." },
    { property: "og:title", content: "Scan — Recherche immédiate | Vitala" },
    { property: "og:description", content: "Une recherche de Flashs lancée par vous, selon vos critères." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ScanView,
});