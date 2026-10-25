import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { SmartCard } from "./SmartCard";
import { Icon } from "./Icon";

interface RadarCardProps {
  title: ReactNode;
  /** A short distance or proximity label, e.g. "120 m". */
  distance?: ReactNode;
  description?: ReactNode;
  /** Trailing slot — usually a Chip or action. */
  trailing?: ReactNode;
  onOpen?: () => void;
}

/**
 * RadarCard — generic card for "what is near you" content.
 * Domain-agnostic: any nearby/proximity feature can plug into it.
 */
export function RadarCard({ title, distance, description, trailing, onOpen }: RadarCardProps) {
  return (
    <SmartCard
      interactive={!!onOpen}
      onClick={onOpen}
      tone="plain"
      leading={
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon as={MapPin} size="md" />
        </div>
      }
      title={title}
      description={description}
      trailing={
        trailing ??
        (distance ? <span className="text-xs text-muted-foreground">{distance}</span> : undefined)
      }
    />
  );
}
