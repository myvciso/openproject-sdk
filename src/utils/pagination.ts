import type { HalCollection, HalLink, HalResource } from "../types/hal.js";
import type { HttpClient } from "../http.js";

export async function* iterateCollection<T extends HalResource>(
  http: HttpClient,
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): AsyncGenerator<T> {
  let nextPath: string | undefined = path;
  let nextQuery = query;

  while (nextPath) {
    const collection: HalCollection<T> = await http.get<HalCollection<T>>(
      nextPath,
      nextQuery,
    );
    for (const element of collection._embedded.elements) {
      yield element;
    }

    const nextLink: HalLink | undefined = (() => {
      const link = collection._links.nextByOffset ?? collection._links.nextByCursor;
      return Array.isArray(link) ? undefined : link;
    })();

    if (!nextLink) {
      break;
    }

    const url: URL = new URL(nextLink.href, http.baseUrl);
    nextPath = url.pathname;
    nextQuery = Object.fromEntries(url.searchParams.entries());
  }
}

export async function collectAll<T extends HalResource>(
  http: HttpClient,
  path: string,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterateCollection<T>(http, path, query)) {
    items.push(item);
  }
  return items;
}
