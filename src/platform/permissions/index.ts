/**
 * Device permissions foundation (camera, geolocation, notifications…).
 */
export type PermissionKey =
  | "geolocation"
  | "camera"
  | "microphone"
  | "notifications"
  | "clipboard-read"
  | "clipboard-write";

export type PermissionState = "prompt" | "granted" | "denied" | "unsupported";

export interface PermissionsAdapter {
  query: (k: PermissionKey) => Promise<PermissionState>;
  request: (k: PermissionKey) => Promise<PermissionState>;
}

export const noopPermissions: PermissionsAdapter = {
  query: async () => "unsupported",
  request: async () => "unsupported",
};
