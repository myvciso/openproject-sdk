import { OpenProjectError } from "./errors.js";
import type { ListQuery } from "./types/filters.js";

export type AuthMode = "bearer" | "basic";

export interface HttpClientOptions {
  baseUrl: string;
  apiKey: string;
  auth?: AuthMode;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

export class HttpClient {
  readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly auth: AuthMode;
  private readonly fetchFn: typeof fetch;
  private readonly extraHeaders: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.auth = options.auth ?? "bearer";
    this.fetchFn = options.fetch ?? fetch;
    this.extraHeaders = options.headers ?? {};
  }

  private authHeaders(): Record<string, string> {
    if (this.auth === "basic") {
      const encoded = Buffer.from(`apikey:${this.apiKey}`).toString("base64");
      return { Authorization: `Basic ${encoded}` };
    }
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): string {
    const url = new URL(path.startsWith("/") ? path : `/${path}`, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      query?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
    },
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/hal+json",
      "Content-Type": "application/hal+json",
      ...this.authHeaders(),
      ...this.extraHeaders,
      ...options?.headers,
    };

    const response = await this.fetchFn(this.buildUrl(path, options?.query), {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw await OpenProjectError.fromResponse(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  get<T>(
    path: string,
    query?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    return this.request<T>("GET", path, { query });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, { body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, { body });
  }

  delete(path: string): Promise<void> {
    return this.request<void>("DELETE", path);
  }

  listQueryToParams(query?: ListQuery): Record<string, string | number | boolean | undefined> {
    if (!query) {
      return {};
    }

    const params: Record<string, string | number | boolean | undefined> = {};

    if (query.filters?.length) {
      params.filters = JSON.stringify(query.filters);
    }
    if (query.offset !== undefined) {
      params.offset = query.offset;
    }
    if (query.pageSize !== undefined) {
      params.pageSize = query.pageSize;
    }
    if (query.sortBy?.length) {
      params.sortBy = JSON.stringify(query.sortBy);
    }
    if (query.groupBy !== undefined) {
      params.groupBy = query.groupBy;
    }
    if (query.showSums !== undefined) {
      params.showSums = query.showSums;
    }

    return params;
  }
}
