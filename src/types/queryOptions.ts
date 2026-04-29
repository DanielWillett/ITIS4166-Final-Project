import type { Request } from "express";

export interface QueryOptions<TSearchable, TSortable> {
    offset: undefined | number,
    limit: undefined | number,
    searchBy: undefined | TSearchable,
    search: undefined | string,
    orderBy: undefined | TSortable,
    sortDescending: undefined |boolean
};

export function parseQueryOptions<TSearchable, TSortable>(req : Request) : QueryOptions<TSearchable, TSortable>
{
    let offset : number | undefined = undefined, limit : number | undefined = undefined;

    if (req.query.offset) {
        offset = parseInt(req.query.offset.toString());
        if (isNaN(offset) || offset <= 0) offset = undefined;
    }

    if (req.query.limit) {
        limit = parseInt(req.query.limit.toString());
        if (isNaN(limit) || limit < 0) limit = undefined;
    }

    let searchBy : null | string = null;
    if (req.query.searchBy) {
        searchBy = req.query.searchBy.toString();
    }

    let search = req.query.search?.toString();
    
    let orderBy : null | string = null;
    if (req.query.orderBy) {
        orderBy = req.query.orderBy.toString();
    }

    const options : QueryOptions<TSearchable, TSortable> = {
        sortDescending: req.query.sort === "desc",
        limit: limit,
        offset: offset,
        searchBy: searchBy as (undefined | TSearchable),
        orderBy: orderBy as (undefined | TSortable),
        search: search
    };

    return options;
}