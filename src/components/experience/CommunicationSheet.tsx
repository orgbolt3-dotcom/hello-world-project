import { lazy, Suspense } from "react";
import { Sheet } from "@/components/app/Sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/lib/i18n/useI18n";

const AssistantTab = lazy(() =>
  import("@/domains/assistant/ui/AssistantTab").then((module) => ({
    default: module.AssistantTab,
  })),
);

export function CommunicationSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("communication.title")}
      className="max-h-[92dvh]"
    >
      <Tabs defaultValue="assistant">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger className="px-1 text-[11px] sm:text-sm" value="notifications">
            {t("communication.notifications")}
          </TabsTrigger>
          <TabsTrigger className="px-1 text-[11px] sm:text-sm" value="assistant">
            {t("communication.assistant")}
          </TabsTrigger>
          <TabsTrigger className="px-1 text-[11px] sm:text-sm" value="conversations">
            {t("communication.conversations")}
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="notifications"
          className="py-8 text-center text-sm text-muted-foreground"
        >
          {t("communication.notifications.empty")}
        </TabsContent>
        <TabsContent value="assistant">
          <Suspense
            fallback={
              <p role="status" className="py-8 text-center text-sm text-muted-foreground">
                {t("app.loading")}
              </p>
            }
          >
            <AssistantTab />
          </Suspense>
        </TabsContent>
        <TabsContent
          value="conversations"
          className="py-8 text-center text-sm text-muted-foreground"
        >
          {t("communication.conversations.empty")}
        </TabsContent>
      </Tabs>
    </Sheet>
  );
}
