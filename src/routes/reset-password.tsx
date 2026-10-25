import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordView } from "@/domains/auth/ui/ResetPasswordView";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Vitala" },
      {
        name: "description",
        content: "Choisissez un nouveau mot de passe pour votre compte Vitala.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Nouveau mot de passe — Vitala" },
      {
        property: "og:description",
        content: "Choisissez un nouveau mot de passe pour votre compte Vitala.",
      },
    ],
  }),
  component: ResetPasswordView,
});
