import * as repo from "../repositories/stockItemRecordRepo.js";
import type StockItemRecord from "../types/stockItemRecord.js";
import type { StockItemRecordQueryOptions } from "../types/stockItemRecordQueryOptions.js";

export function getStockItemRecord(id: number) : Promise<StockItemRecord | null> {
    return repo.readById(id);
};

export function getStockItemRecords(options: StockItemRecordQueryOptions) : Promise<StockItemRecord[]> {
    return repo.readMany(options);
};

export function createStockItemRecord(item: StockItemRecord) : Promise<StockItemRecord> {
    return repo.create(item);
};