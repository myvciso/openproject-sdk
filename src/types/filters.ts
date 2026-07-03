export type FilterOperator =
  | "="
  | "&="
  | "!"
  | ">="
  | "<="
  | "t-"
  | "t+"
  | "<t+"
  | ">t+"
  | ">t-"
  | "<t-"
  | "*"
  | "!*"
  | "**"
  | "=d"
  | "<>d"
  | "w"
  | "t"
  | "~"
  | "!~"
  | "o"
  | "c"
  | "ow";

export interface FilterClause {
  operator: FilterOperator | string;
  values: string[];
}

export type Filter = Record<string, FilterClause>;

export interface ListQuery {
  filters?: Filter[];
  offset?: number;
  pageSize?: number;
  sortBy?: [string, "asc" | "desc"][];
  groupBy?: string;
  showSums?: boolean;
}
