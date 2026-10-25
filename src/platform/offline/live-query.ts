import { useLiveQuery } from "dexie-react-hooks";
import { isLocalDatabaseAvailable } from "@eco/core-db";
import { useLocalScopeRevision } from "./local-scope";

/**
 * SSR-safe live read of the local database.
 *
 * The query is only executed in the browser: on the server there is no local
 * database, so the caller receives `undefined` and renders its loading state.
 * Results update automatically whenever the underlying rows change — including
 * when the active user changes.
 */
export function useLocalQuery<T>(query: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const scopeRevision = useLocalScopeRevision();

  return useLiveQuery(async () => {
    if (!isLocalDatabaseAvailable()) {
      return undefined as T | undefined;
    }

    return await query();
  }, [...deps, scopeRevision]);
}

/** Same as useLocalQuery but never returns undefined. */
export function useLocalQueryWithDefault<T>(
  query: () => Promise<T>,
  fallback: T,
  deps: unknown[] = [],
): T {
  return useLocalQuery(query, deps) ?? fallback;
}
