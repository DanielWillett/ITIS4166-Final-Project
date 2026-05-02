import type { QueryOptions } from "./queryOptions.js";

export type SearchableProperty = "username" | "firstName" | "lastName" | "realName" | "createdBy" | "role";
export type SortableProperty = "id" | "username" | "firstName" | "lastName" | "createdBy" | "createdAt";

export type UserQueryOptions = QueryOptions<SearchableProperty, SortableProperty>;