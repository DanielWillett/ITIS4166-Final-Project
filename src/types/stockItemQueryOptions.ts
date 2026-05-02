import type { QueryOptions } from "./queryOptions.js";

export type SearchableProperty = "item" | "manufacturer" | "vendor" | "location" | "createdBy";
export type SortableProperty = "id" | "item" | "quantity" | "manufacturer" | "vendor" | "url" | "location" | "createdBy" | "createdAt";

export type StockItemQueryOptions = QueryOptions<SearchableProperty, SortableProperty>;