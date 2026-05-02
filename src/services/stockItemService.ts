import * as repo from "../repositories/stockItemRepo.js";
import * as stockItemRecordService from "./stockItemRecordService.js";
import type StockItem from "../types/stockItem.js";
import type { StockItemQueryOptions } from "../types/stockItemQueryOptions.js";

const fieldIds = new Map<string, number>();
fieldIds.set("quantity", 1);
fieldIds.set("manufacturer", 2);
fieldIds.set("vendor", 3);
fieldIds.set("url", 4);
fieldIds.set("location", 5);

export function getStockItem(id: number) : Promise<StockItem | null> {
    return repo.readById(id);
};

export function getStockItems(options: StockItemQueryOptions) : Promise<StockItem[]> {
    return repo.readMany(options);
};

export async function createStockItem(item: StockItem, user: number | null = null) : Promise<StockItem> {
    const stockItem = await repo.create(item);

    try {
        await stockItemRecordService.createStockItemRecord({
            description: "Created",
            fieldId: 0,
            id: -1,
            oldValue: "",
            stockItem: stockItem.id,
            timestamp: stockItem.createdAt,
            user: user
        });
    } catch (err) {
        await repo.remove(stockItem.id);
        throw err;
    }

    return stockItem;
};

export async function updateStockItem(stockItemId: number, update: repo.StockItemUpdateParameters, user: number | null = null) : Promise<StockItem | null> {
    const timestamp = new Date(Date.now());
    const oldStockItem = await repo.readById(stockItemId);
    const stockItem = await repo.update(stockItemId, update);
    if (!stockItem) {
        return null;
    }
    
    try {
        let key : keyof repo.StockItemUpdateParameters;
        for (key in update) {
            const newValue = update[key];
            const oldValue = oldStockItem ? oldStockItem[key] : null;
            await stockItemRecordService.createStockItemRecord({
                description: `Property ${key} changed to '${newValue?.toString() ?? "NULL"}'`,
                fieldId: fieldIds.get(key) ?? -1,
                id: -1,
                oldValue: oldValue?.toString() ?? "NULL",
                stockItem: stockItem.id,
                timestamp: timestamp,
                user: user
            });
        }
    } catch (err) {
        console.log("Failure logging changes.");
        console.log(err);
    }

    return stockItem;
};

export function deleteStockItem(stockItemId: number) : Promise<boolean> {
    return repo.remove(stockItemId);
}