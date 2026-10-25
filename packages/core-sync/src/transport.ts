import {
  validatePullResult,
  validatePushResult,
  type PullRequest,
  type PullResult,
  type PushRequest,
  type PushResult,
} from "@eco/core-contracts";

/** Network side of the engine. One implementation per runtime. */
export interface SyncTransport {
  pull(request: PullRequest): Promise<PullResult>;
  push(request: PushRequest): Promise<PushResult>;
}

/** Thrown when the backend refused the credentials — retrying will not help. */
export class SyncAuthError extends Error {
  constructor(message = "unauthorized") {
    super(message);
    this.name = "SyncAuthError";
  }
}

/** Thrown when the network is unreachable — retrying later will help. */
export class SyncNetworkError extends Error {
  constructor(message = "offline") {
    super(message);
    this.name = "SyncNetworkError";
  }
}

/** The peer returned a malformed payload or rejected the protocol contract. */
export class SyncProtocolError extends Error {
  constructor(message = "invalid_protocol") {
    super(message);
    this.name = "SyncProtocolError";
  }
}

export interface HttpTransportOptions {
  /** Absolute or same-origin base path of the sync endpoints. */
  baseUrl: string;
  /** Returns the current access token, or null when signed out. */
  getAccessToken: () => string | null;
  fetchImpl?: typeof fetch;
}

/** Transport talking to the backend sync endpoints over plain HTTP. */
export function createHttpTransport(options: HttpTransportOptions): SyncTransport {
  const doFetch = options.fetchImpl ?? fetch;

  async function call<TBody, TResult>(path: string, body: TBody): Promise<TResult> {
    const token = options.getAccessToken();
    if (!token) throw new SyncAuthError("no_session");

    let response: Response;
    try {
      response = await doFetch(`${options.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      throw new SyncNetworkError(error instanceof Error ? error.message : "network");
    }

    if (response.status === 401 || response.status === 403) {
      throw new SyncAuthError();
    }
    if (response.status >= 400 && response.status < 500) {
      throw new SyncProtocolError(`http_${response.status}`);
    }
    if (!response.ok) {
      throw new SyncNetworkError(`http_${response.status}`);
    }
    try {
      return (await response.json()) as TResult;
    } catch {
      throw new SyncProtocolError("invalid_json_response");
    }
  }

  return {
    async pull(request: PullRequest) {
      const response = await call<PullRequest, unknown>("/pull", request);
      try {
        return validatePullResult(response, request);
      } catch {
        throw new SyncProtocolError("invalid_pull_response");
      }
    },
    async push(request: PushRequest) {
      const response = await call<PushRequest, unknown>("/push", request);
      try {
        return validatePushResult(response, request);
      } catch {
        throw new SyncProtocolError("invalid_push_response");
      }
    },
  };
}
