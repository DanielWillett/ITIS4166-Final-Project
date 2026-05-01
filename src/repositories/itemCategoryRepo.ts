import type { DefaultArgs } from "@prisma/client/runtime/client";

import prisma from '../db.js';
import type { ItemCategoryQueryOptions } from "../types/itemCategoryQueryOptions.js";
import type ItemCategory from "../types/itemCategory.js";
import { Prisma } from "../generated/prisma/index.js";
import HttpError from "../errors/NotFoundError.js";

export interface CategoryUpdateParameters {
    name: string | undefined,
    parent: number | null | undefined
}

/**
 * Query the entire item category list.
 * @param options Query filters and sort options.
 * @returns An array of found item categories.
 */
export async function readMany(options: ItemCategoryQueryOptions) : Promise<ItemCategory[]> {
  let conditions : Prisma.ItemCategoryWhereInput = {};

  if (options.search) {
    if (!options.searchBy) {
      conditions.name = { contains: options.search, mode: "insensitive" };
    }
    else if (options.searchBy === "createdBy" || options.searchBy === "parent") {
      // search by creating User or parent category
      const id = parseInt(options.search);
      if (!isNaN(id)) {
        if (options.searchBy === "createdBy") {
          conditions.createdByUserId = id;
        } else {
          conditions.parentId = id;
        }
      } else {
        throw new HttpError(`Expected integer value for ${options.searchBy} search parameter.`, 400);
      }
    } else {
      // search by other field
      conditions[options.searchBy] = { contains: options.search, mode: "insensitive" };
    }
  }

  let query: Prisma.ItemCategoryFindManyArgs<DefaultArgs> = {
    where: conditions
  };

  if (options.orderBy) {
    query.orderBy = { [options.orderBy]: options.sortDescending ? "desc" : "asc" };
  }

  if (options.limit !== undefined) {
    query.take = options.limit;
  }
  if (options.offset !== undefined) {
    query.skip = options.offset;
  }

  const models = await prisma.itemCategory.findMany(query);
  return models.map(createItemCategoryFromModel);
};

/**
 * Get an item category by their ID.
 * @param id The primary key of the item category to find.
 * @returns The item category, or null if it wasn't found.
 */
export async function readById(id: number) : Promise<ItemCategory | null> {
  const model = await prisma.itemCategory.findFirst({ where: { id } });
  if (!model) {
    return null;
  }

  return createItemCategoryFromModel(model);
};

/**
 * Create a new item category with the given information.
 * @param category Item category information.
 * @returns The created item category.
 */
export async function create(category: ItemCategory) : Promise<ItemCategory> {
  try {
    const model = await prisma.itemCategory.create({
      data: {
        createdAt: category.createdAt,
        name: category.name,
        createdByUserId: category.createdById,
        parentId: category.parentId
      }
    });

    return createItemCategoryFromModel(model);

  } catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError)) {
      throw err;
    }

    if (err.code === "P2004") {
      // constraint error
      throw new HttpError("Invalid createdBy User ID.", 400);
    }
    else {
      throw err;
    }

  }
};

/**
 * Update properties in a category.
 * @param categoryId Primary key of the category to update.
 * @param update Properties to update.
 * @returns The updated category, or null if it couldn't be found.
 */
export async function update(categoryId: number, update: CategoryUpdateParameters) : Promise<ItemCategory | null> {
  try {
    let updateData : Prisma.ItemCategoryUpdateInput = { };
    if (update.name !== undefined) {
      updateData.name = update.name;
    }
    if (update.parent !== undefined) {
      updateData.parent = update.parent === null ? { disconnect: true } : { connect: { id: update.parent } };
    }
    
    const model = await prisma.itemCategory.update({
      where: { id: categoryId },
      data: updateData
    });

    return createItemCategoryFromModel(model);
  }
  catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2025") {
      throw err;
    }

    // P2025 = not found error
    return null;
  }
}

/**
 * Delete a category and all it's children.
 * @param userId Primary key of the category to delete.
 * @returns Whether or not the category was found and deleted.
 */
export async function remove(categoryId: number) : Promise<boolean> {
  const { count } = await prisma.itemCategory.deleteMany({ where: { id: categoryId } });
  return count > 0;
};

function createItemCategoryFromModel(model: any) : ItemCategory {
  return {
      id: model.id,
      name: model.name,
      parentId: model.parentId,
      createdById: model.createdByUserId,
      createdAt: model.createdAt
  };
}