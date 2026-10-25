import type { ComponentType, SVGProps } from "react";
import { iconSize, iconStroke } from "@/lib/design/tokens";
import { cn } from "@/lib/utils";

type LucideLike = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

interface IconProps {
  as: LucideLike;
  size?: keyof typeof iconSize;
  className?: string;
  "aria-label"?: string;
}

/**
 * Icon — single source of truth for icon size & stroke across the app.
 * Wrap any lucide-react icon so visual weight stays consistent.
 *
 *   <Icon as={Home} size="md" />
 */
export function Icon({ as: Cmp, size = "md", className, ...rest }: IconProps) {
  const decorative = !rest["aria-label"];
  return (
    <Cmp
      size={iconSize[size]}
      strokeWidth={iconStroke}
      className={cn("shrink-0", className)}
      aria-hidden={decorative || undefined}
      {...rest}
    />
  );
}
