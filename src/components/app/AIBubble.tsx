import type { ReactNode } from "react";
import { Compass } from "lucide-react";
import { motion } from "framer-motion";
import { Icon } from "./Icon";
import { transition } from "@/lib/design/motion";
import { useReducedMotion } from "@/lib/design/useReducedMotion";
import { cn } from "@/lib/utils";

type Author = "assistant" | "user";

interface AIBubbleProps {
  author?: Author;
  children: ReactNode;
  /** Loading / typing state — renders a soft pulse instead of content. */
  thinking?: boolean;
  className?: string;
}

/**
 * AIBubble — generic chat bubble for assistant/user messages.
 * Phase 4/5 — assistant glass + breathing avatar presence.
 */
export function AIBubble({ author = "assistant", children, thinking, className }: AIBubbleProps) {
  const isAssistant = author === "assistant";
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.base}
      className={cn("flex w-full gap-2", isAssistant ? "justify-start" : "justify-end", className)}
    >
      {isAssistant && (
        <div
          className={cn(
            "mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
            "bg-[color-mix(in_oklab,var(--intelligence)_18%,var(--surface-elevated))]",
            "text-[var(--intelligence)] glow-soft",
            !reduced && "motion-presence",
          )}
        >
          <Icon as={Compass} size="xs" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isAssistant
            ? "glass-assistant text-foreground rounded-tl-md"
            : "bg-primary text-primary-foreground rounded-tr-md",
        )}
      >
        {thinking ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60" />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-60"
              style={{ animationDelay: "240ms" }}
            />
          </span>
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}
