export { OpenProjectClient, type OpenProjectClientOptions } from "./client.js";
export { OpenProjectError } from "./errors.js";
export { HttpClient, type AuthMode, type HttpClientOptions } from "./http.js";

export type {
  HalCollection,
  HalLink,
  HalLinks,
  HalResource,
  Formattable,
  ApiErrorBody,
} from "./types/hal.js";

export type {
  Filter,
  FilterClause,
  FilterOperator,
  ListQuery,
} from "./types/filters.js";

export {
  ProjectsResource,
  type Project,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "./resources/projects.js";

export {
  WorkPackagesResource,
  type WorkPackage,
  type CreateWorkPackageInput,
  type UpdateWorkPackageInput,
} from "./resources/work-packages.js";

export {
  UsersResource,
  type User,
} from "./resources/users.js";

export {
  TimeEntriesResource,
  type TimeEntry,
  type CreateTimeEntryInput,
  type UpdateTimeEntryInput,
} from "./resources/time-entries.js";

export {
  StatusesResource,
  TypesResource,
  PrioritiesResource,
  type Status,
  type Type,
  type Priority,
} from "./resources/metadata.js";

export { linkTo, linkFromHref, resourceHref } from "./utils/links.js";
export { collectAll, iterateCollection } from "./utils/pagination.js";
