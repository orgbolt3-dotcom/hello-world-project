/**
 * Role contract. Roles are NEVER stored on the user/profile record — they live
 * in a dedicated backend table and are verified server-side. This type only
 * describes what the client is allowed to render.
 */

export const APP_ROLES = ["member", "moderator", "admin", "owner"] as const;

export type AppRole = (typeof APP_ROLES)[number];

const RANK: Record<AppRole, number> = {
  member: 0,
  moderator: 1,
  admin: 2,
  owner: 3,
};

/** True when `role` is at least as privileged as `required`. */
export function roleAtLeast(role: AppRole, required: AppRole): boolean {
  return RANK[role] >= RANK[required];
}
