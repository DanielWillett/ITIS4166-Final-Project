import type { QueryOptions } from "./queryOptions.js";

export type SearchableProperty = "stockItem" | "fieldId" | "description" | "oldValue" | "user";
export type SortableProperty = "id" | "stockItem" | "fieldId" | "description" | "oldValue" | "user" | "timestamp";

export type StockItemRecordQueryOptions = QueryOptions<SearchableProperty, SortableProperty>;