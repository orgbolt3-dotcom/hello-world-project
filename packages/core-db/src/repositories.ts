import type {
  AuditEntryRecord,
  FlashRecord,
  MediaRecord,
  NotificationRecord,
  PostRecord,
  UdiRecord,
  UserRecord,
} from "@eco/core-contracts";
import { createRepository } from "./repository";

/** Generic repositories for tables without a dedicated domain state machine. */
export const usersRepository = createRepository<UserRecord>("users");

export const udiRepository = createRepository<UdiRecord>("udi");

export const flashesRepository = createRepository<FlashRecord>("flashes");

export const postsRepository = createRepository<PostRecord>("posts");

export const mediaRepository = createRepository<MediaRecord>("media");

export const notificationsRepository = createRepository<NotificationRecord>("notifications");

export const auditRepository = createRepository<AuditEntryRecord>("audit");
