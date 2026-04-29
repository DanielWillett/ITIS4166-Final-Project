
export type SearchableProperty = "username" | "firstName" | "lastName" | "createdBy" | "createdAt" | "realName";
export type SortableProperty = "id" | SearchableProperty;

export interface UserQueryOptions {
    offset: undefined | number,
    limit: undefined | number,
    searchBy: undefined | SearchableProperty,
    search: undefined | string,
    orderBy: undefined | SortableProperty,
    sortDescending: undefined |boolean
};