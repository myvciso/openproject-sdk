export interface HalLink {
  href: string;
  title?: string;
  method?: string;
  templated?: boolean;
}

export type HalLinks = Record<string, HalLink | HalLink[]>;

export interface HalResource {
  _type: string;
  _links: HalLinks;
  _embedded?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface HalCollection<T extends HalResource = HalResource> extends HalResource {
  total: number;
  count: number;
  pageSize?: number;
  offset?: number;
  _embedded: {
    elements: T[];
  };
}

export interface Formattable {
  format: string;
  raw: string;
  html?: string;
}

export interface ApiErrorBody extends HalResource {
  _type: "Error";
  errorIdentifier: string;
  message: string;
}
