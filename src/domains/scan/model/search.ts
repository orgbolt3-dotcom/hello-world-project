import type { FlashCategory, FlashRecord, PublicFlash } from "@eco/core-contracts";

export interface ScanCriteria {
  text: string;
  category: FlashCategory | null;
  area: string;
}

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();

/** Search only complete, live public previews; never infer missing metadata. */
export function searchSavedFlashes(records: FlashRecord[], criteria: ScanCriteria, now: number): PublicFlash[] {
  const words = normalize(criteria.text).split(/\s+/).filter(Boolean);
  const area = normalize(criteria.area);
  return records.flatMap((flash): PublicFlash[] => {
    if (flash.status !== "live" || flash.deletedAt !== null || flash.revision === null ||
      flash.expiresAt === null || flash.expiresAt <= now || !flash.kind || !flash.category ||
      !flash.timeSlot || !flash.areaLabel) return [];
    if (criteria.category && flash.category !== criteria.category) return [];
    if (area && !normalize(flash.areaLabel).includes(area)) return [];
    if (!words.every((word) => normalize(flash.title).includes(word))) return [];
    return [{ id: flash.id, kind: flash.kind, category: flash.category, title: flash.title,
      timeSlot: flash.timeSlot, areaLabel: flash.areaLabel, createdAt: flash.createdAt, expiresAt: flash.expiresAt }];
  }).sort((a, b) => b.createdAt - a.createdAt);
}