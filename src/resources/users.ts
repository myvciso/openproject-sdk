import type { HalCollection, HalResource } from "../types/hal.js";
import type { ListQuery } from "../types/filters.js";
import type { HttpClient } from "../http.js";
import { collectAll, iterateCollection } from "../utils/pagination.js";

export interface User extends HalResource {
  _type: "User";
  id: number;
  name: string;
  login?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  admin?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class UsersResource {
  constructor(private readonly http: HttpClient) {}

  list(query?: ListQuery): Promise<HalCollection<User>> {
    return this.http.get<HalCollection<User>>(
      "/api/v3/users",
      this.http.listQueryToParams(query),
    );
  }

  listAll(query?: ListQuery): Promise<User[]> {
    return collectAll<User>(
      this.http,
      "/api/v3/users",
      this.http.listQueryToParams(query),
    );
  }

  iterate(query?: ListQuery): AsyncGenerator<User> {
    return iterateCollection<User>(
      this.http,
      "/api/v3/users",
      this.http.listQueryToParams(query),
    );
  }

  get(id: number): Promise<User> {
    return this.http.get<User>(`/api/v3/users/${id}`);
  }

  me(): Promise<User> {
    return this.http.get<User>("/api/v3/users/me");
  }
}
