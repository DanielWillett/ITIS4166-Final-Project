import type { QueryOptions } from "./queryOptions.js";

export type SearchableProperty = "name" | "parent" | "createdBy";
export type SortableProperty = "id" | "name" | "parent" | "createdBy" | "createdAt";

export type ItemCategoryQueryOptions = QueryOptions<SearchableProperty, SortableProperty>;