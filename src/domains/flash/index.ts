/**
 * flash domain — ephemeral signals.
 * Owns: FlashCard UI, flash state/types/services (to be added).
 */
export const FLASH_DOMAIN = "flash" as const;
export { FlashCard } from "@/components/app/FlashCard";
export * from "./data";
