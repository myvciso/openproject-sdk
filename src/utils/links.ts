import type { HalLink } from "../types/hal.js";

export function resourceHref(
  resource: string,
  id: string | number,
): string {
  return `/api/v3/${resource}/${id}`;
}

export function linkTo(resource: string, id: string | number): HalLink {
  return { href: resourceHref(resource, id) };
}

export function linkFromHref(href: string): HalLink {
  return { href };
}
