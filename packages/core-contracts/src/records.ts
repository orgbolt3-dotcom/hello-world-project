import type { FlashCategory, FlashKind, FlashTimeSlot } from "./flash";
import type {
  AuditEntryId,
  FlashId,
  MediaId,
  MissionId,
  NotificationId,
  PostId,
  UdiId,
  UserId,
} from "./ids";

/**
 * Every synchronisable record carries the same envelope so the sync worker can
 * reason about any table without knowing its business meaning.
 */
export interface BaseRecord {
  /** Client-generated UUID. Stable across offline creation and server insert. */
  id: string;

  /** Milliseconds since epoch, client clock at creation. */
  createdAt: number;

  /** Milliseconds since epoch, last local write. Drives conflict resolution. */
  updatedAt: number;

  /** Server revision cursor; null while the record has never been pushed. */
  revision: number | null;

  /** Soft delete — records are never physically removed before sync confirms. */
  deletedAt: number | null;
}

export type UserStatus = "active" | "invited" | "suspended" | "closed";

export interface UserRecord extends BaseRecord {
  id: UserId;
  displayName: string;
  handle: string;
  avatarMediaId: MediaId | null;
  status: UserStatus;
  locale: string;
  trustScore: number;
}

/** UDI — Unique Digital Identity: the progressive identity of a member. */
export type UdiLevel = "guest" | "identified" | "verified" | "trusted";

export interface UdiRecord extends BaseRecord {
  id: UdiId;
  userId: UserId;
  level: UdiLevel;
  verifiedAt: number | null;

  /** Verified attributes, never raw documents. Documents live in Storage. */
  attributes: Record<string, string>;
}

export type FlashStatus = "draft" | "live" | "expired" | "archived";

export interface FlashRecord extends BaseRecord {
  id: FlashId;
  authorId: UserId;
  title: string;
  body: string;
  status: FlashStatus;

  /** Public presentation fields; absent on drafts created before they are set. */
  kind?: FlashKind;
  category?: FlashCategory;
  timeSlot?: FlashTimeSlot;
  areaLabel?: string;

  /** Epoch ms after which the flash stops being visible. */
  expiresAt: number | null;

  mediaIds: MediaId[];
}

export type MissionStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "pending_validation"
  | "completed"
  | "disputed"
  | "cancelled";

export type MissionAction =
  | {
      type: "assign";
      assigneeId: UserId;
    }
  | {
      type: "decline";
    }
  | {
      type: "start";
    }
  | {
      type: "submit_result";
    }
  | {
      type: "validate_result";
    }
  | {
      type: "dispute";
    }
  | {
      type: "cancel";
    };

export interface MissionRecord extends BaseRecord {
  id: MissionId;
  authorId: UserId;
  assigneeId: UserId | null;
  title: string;
  brief: string;
  status: MissionStatus;
  rewardAmount: number;
  rewardCurrency: string;
  dueAt: number | null;
}

export type PostVisibility = "public" | "circle" | "private";

export interface PostRecord extends BaseRecord {
  id: PostId;
  authorId: UserId;
  body: string;
  visibility: PostVisibility;
  mediaIds: MediaId[];
  reactionCount: number;
  replyCount: number;
}

export type MediaKind = "image" | "video" | "audio" | "document";

export type MediaState = "local" | "uploading" | "remote" | "failed";

export interface MediaRecord extends BaseRecord {
  id: MediaId;
  kind: MediaKind;
  state: MediaState;

  /** Storage object path once uploaded. */
  remotePath: string | null;

  mimeType: string;
  byteSize: number;
  width: number | null;
  height: number | null;
}

export type NotificationChannel = "in_app" | "push" | "email" | "sms";

export interface NotificationRecord extends BaseRecord {
  id: NotificationId;
  recipientId: UserId;
  channel: NotificationChannel;
  titleKey: string;
  bodyKey: string;
  params: Record<string, string>;
  readAt: number | null;
}

export interface AuditEntryRecord extends BaseRecord {
  id: AuditEntryId;
  actorId: UserId | null;
  action: string;
  targetTable: string;
  targetId: string;

  /** Human-readable summary, already written in plain language. */
  summary: string;
}
