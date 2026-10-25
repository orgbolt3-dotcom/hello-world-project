/**
 * shared/components — domain-agnostic composed primitives only.
 *
 * Governance: shared MUST NOT export business-specific components
 * (WalletCard, RadarCard, TrustCard, FlashCard, etc.). Those live in
 * their owning domain and are re-exported through domains/<name>.
 */
export { Icon } from "@/components/app/Icon";
export { Surface } from "@/components/app/Surface";
export { SmartCard } from "@/components/app/SmartCard";
export { AIBubble } from "@/components/app/AIBubble";
export { FloatingButton } from "@/components/app/FloatingButton";
export { SmartTabs, type SmartTab } from "@/components/app/SmartTabs";
export { Sheet } from "@/components/app/Sheet";
export { Modal } from "@/components/app/Modal";
export { Indicator } from "@/components/app/Indicator";
export { EmptyState } from "@/components/app/EmptyState";
export { StatusBanner } from "@/components/app/StatusBanner";
export { FormField } from "@/components/app/FormField";
export { SkeletonLine, SkeletonText, SkeletonCard, SkeletonList } from "@/components/app/Skeletons";
export { SyncIndicator } from "./SyncIndicator";
