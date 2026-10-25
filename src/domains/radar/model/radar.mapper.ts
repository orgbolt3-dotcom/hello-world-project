import type { RadarRecord } from "@eco/core-contracts";

export function mapRadarRow(row: Record<string, unknown>): RadarRecord {
  return {
    id: String(row.id),
    ownerId: String(row.owner_id),
    title: String(row.title),
    query: String(row.query),
    category: row.category === null ? null : (row.category as RadarRecord["category"]),
    areaLabel: String(row.area_label),
    radiusKm: Number(row.radius_km) as RadarRecord["radiusKm"],
    startsAt: Number(row.starts_at),
    expiresAt: Number(row.expires_at),
    status: row.status as RadarRecord["status"],
    nextReviewAt: row.next_review_at === null ? null : Number(row.next_review_at),
    lastReviewedAt: row.last_reviewed_at === null ? null : Number(row.last_reviewed_at),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    deletedAt: row.deleted_at === null ? null : Number(row.deleted_at),
    revision: Number(row.revision),
  };
}
