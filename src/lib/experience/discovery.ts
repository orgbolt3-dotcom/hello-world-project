/**
 * Discovery foundation — sections registry.
 *
 * The home page surfaces a curated, ordered list of discovery sections.
 * Each section is a stable extension point: domains add themselves
 * without home page needing to know they exist.
 */
import type { ReactNode } from "react";

export interface DiscoverySection {
  key: string;
  /** i18n key for the section title. */
  titleKey: string;
  /** Lower order = higher on the page. */
  order: number;
  /** Renders the section body. Receives no props by design. */
  render: () => ReactNode;
}

const sections = new Map<string, DiscoverySection>();

export function registerDiscoverySection(section: DiscoverySection) {
  sections.set(section.key, section);
}

export function unregisterDiscoverySection(key: string) {
  sections.delete(key);
}

export function getDiscoverySections(): DiscoverySection[] {
  return [...sections.values()].sort((a, b) => a.order - b.order);
}
