import type { QueryOptions } from "./queryOptions.js";

export type SearchableProperty = "name" | "description" | "createdBy" | "category";
export type SortableProperty = "id" | "name" | "description" | "category" | "createdBy" | "createdAt";

export type ItemQueryOptions = QueryOptions<SearchableProperty, SortableProperty>;