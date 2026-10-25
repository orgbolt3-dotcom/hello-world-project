import type { FlashRecord, UserId } from "@eco/core-contracts";
import { newId } from "@eco/core-contracts";
import { isFlashVisible } from "@eco/core-logic";
import { flashesRepository, useLocalQuery } from "@/platform/offline";

/**
 * Flash data access. The interface calls these functions; they only touch the
 * local database, so everything works with or without a network connection.
 */

export function useLiveFlashes(now = Date.now()) {
  return useLocalQuery<FlashRecord[]>(async () => {
    const flashes = await flashesRepository.list();
    return flashes.filter((flash) => isFlashVisible(flash, now));
  }, []);
}

export function useFlash(id: string) {
  return useLocalQuery<FlashRecord | undefined>(() => flashesRepository.get(id), [id]);
}

export interface NewFlashInput {
  authorId: UserId;
  title: string;
  body: string;
  expiresAt: number | null;
}

export function createFlash(input: NewFlashInput) {
  return flashesRepository.create({
    id: newId<"FlashId">(),
    authorId: input.authorId,
    title: input.title,
    body: input.body,
    status: "live",
    expiresAt: input.expiresAt,
    mediaIds: [],
  } as never);
}

export function archiveFlash(id: string) {
  return flashesRepository.update(id, { status: "archived" } as never);
}

export function deleteFlash(id: string) {
  return flashesRepository.remove(id);
}
