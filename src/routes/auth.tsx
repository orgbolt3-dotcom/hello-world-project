import { createFileRoute } from "@tanstack/react-router";
import { SignInView } from "@/domains/auth/ui/SignInView";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — Écosystème" },
      { name: "description", content: "Rejoignez votre écosystème : identifiez-vous en un geste." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Connexion — Écosystème" },
      { property: "og:description", content: "Identifiez-vous pour retrouver votre écosystème." },
    ],
  }),
  component: SignInView,
});
