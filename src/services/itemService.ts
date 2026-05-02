import * as repo from "../repositories/itemRepo.js";
import type Item from "../types/item.js";
import type { ItemQueryOptions } from "../types/itemQueryOptions.js";

export function getItem(id: number) : Promise<Item | null> {
    return repo.readById(id);
};

export function getItems(options: ItemQueryOptions) : Promise<Item[]> {
    return repo.readMany(options);
};

export function createItem(item: Item) : Promise<Item> {
    return repo.create(item);
};

export function updateItem(itemId: number, update: repo.ItemUpdateParameters) : Promise<Item | null> {
    return repo.update(itemId, update);
};

export function deleteItem(itemId: number) : Promise<boolean> {
    return repo.remove(itemId);
}