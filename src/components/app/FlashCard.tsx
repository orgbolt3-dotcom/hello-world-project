import type { ReactNode } from "react";
import { Zap } from "lucide-react";
import { SmartCard } from "./SmartCard";
import { Icon } from "./Icon";
import { Indicator } from "./Indicator";
import { useI18n } from "@/lib/i18n/useI18n";

interface FlashCardProps {
  title: ReactNode;
  description?: ReactNode;
  /** Optional time-to-live label, e.g. "2h restantes". */
  ttl?: ReactNode;
  /** Action area — usually a small button or chip row. */
  action?: ReactNode;
  onOpen?: () => void;
}

/**
 * FlashCard — generic surface for ephemeral / time-bound content.
 * Domain-agnostic: any feature can use it for "moments" that fade.
 */
export function FlashCard({ title, description, ttl, action, onOpen }: FlashCardProps) {
  const { t } = useI18n();
  return (
    <SmartCard
      interactive={!!onOpen}
      onClick={onOpen}
      tone="elevated"
      eyebrow={
        <span className="inline-flex items-center gap-1.5">
          <Icon as={Zap} size="xs" />
          {t("status.live")}
        </span>
      }
      title={title}
      description={description}
      trailing={ttl ? <Indicator tone="warning" label={ttl} /> : undefined}
      footer={action}
    />
  );
}
