import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { SmartCard } from "./SmartCard";
import { Icon } from "./Icon";
import { Indicator } from "./Indicator";
import { useI18n } from "@/lib/i18n/useI18n";

interface TrustCardProps {
  title: ReactNode;
  /** Trust score 0–100 (visual only — meaning defined by the caller). */
  score?: number;
  description?: ReactNode;
  verified?: boolean;
  onOpen?: () => void;
}

/**
 * TrustCard — generic card to present a trust/score signal about an entity.
 * Domain-agnostic: any feature dealing with reputation can use it.
 */
export function TrustCard({ title, score, description, verified, onOpen }: TrustCardProps) {
  const { t } = useI18n();
  return (
    <SmartCard
      interactive={!!onOpen}
      onClick={onOpen}
      tone="plain"
      leading={
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
          <Icon as={ShieldCheck} size="md" />
        </div>
      }
      title={title}
      description={description}
      trailing={
        <div className="flex flex-col items-end gap-1">
          {typeof score === "number" && (
            <span className="text-sm font-medium tabular-nums">{score}</span>
          )}
          {verified && <Indicator tone="success" label={t("status.verified")} dot />}
        </div>
      }
    />
  );
}
