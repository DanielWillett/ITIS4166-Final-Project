import * as repo from "../repositories/itemCategoryRepo.js";
import type ItemCategory from "../types/itemCategory.js";
import type { ItemCategoryQueryOptions } from "../types/itemCategoryQueryOptions.js";

export function getCategory(id: number) : Promise<ItemCategory | null> {
    return repo.readById(id);
};

export function getCategories(options: ItemCategoryQueryOptions) : Promise<ItemCategory[]> {
    return repo.readMany(options);
};

export function createCategory(category: ItemCategory, passwordHash: string) : Promise<ItemCategory> {
    return repo.create(category, passwordHash);
};

export function updateCategory(categoryId: number, update: repo.CategoryUpdateParameters) : Promise<ItemCategory | null> {
    return repo.update(categoryId, update);
};

export function deleteCategory(categoryId: number) : Promise<boolean> {
    return repo.delete(categoryId);
}