import { Compass } from "lucide-react";
import { useState } from "react";
import { FloatingButton } from "@/components/app/FloatingButton";
import { Sheet } from "@/components/app/Sheet";
import { Icon } from "@/components/app/Icon";
import { AssistantTab } from "@/domains/assistant/ui/AssistantTab";
import { useI18n } from "@/lib/i18n/useI18n";

/** AILayer — global entry point to Vita, the in-app guide. */
export function AILayer() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <FloatingButton
        icon={<Icon as={Compass} size="lg" />}
        label={t("assistant.cta")}
        position="bottom-right"
        size="md"
        onClick={() => setOpen(true)}
      />
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title={t("assistant.cta")}
        description={t("app.tagline")}
      >
        {open && <AssistantTab />}
      </Sheet>
    </>
  );
}
