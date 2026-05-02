import type { DefaultArgs } from "@prisma/client/runtime/client";

import prisma from '../db.js';
import type { ItemQueryOptions } from "../types/itemQueryOptions.js";
import type Item from "../types/item.js";
import { Prisma } from "../generated/prisma/index.js";
import HttpError from "../errors/NotFoundError.js";

export interface ItemUpdateParameters {
    name: string | undefined,
    description: string | undefined,
    category: number | undefined
}

/**
 * Query the entire item list.
 * @param options Query filters and sort options.
 * @returns An array of found items.
 */
export async function readMany(options: ItemQueryOptions) : Promise<Item[]> {
  let conditions : Prisma.ItemWhereInput = {};

  if (options.search) {
    if (!options.searchBy) {
      conditions.name = { contains: options.search, mode: "insensitive" };
    }
    else if (options.searchBy === "createdBy" || options.searchBy === "category") {
      // search by creating User or category
      const id = parseInt(options.search);
      if (!isNaN(id)) {
        if (options.searchBy === "createdBy") {
          conditions.createdByUserId = id;
        } else {
          conditions.categoryId = id;
        }
      } else {
        throw new HttpError(`Expected integer value for ${options.searchBy} search parameter.`, 400);
      }
    } else {
      // search by other field
      conditions[options.searchBy] = { contains: options.search, mode: "insensitive" };
    }
  }

  let query: Prisma.ItemFindManyArgs<DefaultArgs> = {
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

  const models = await prisma.item.findMany(query);
  return models.map(createItemFromModel);
};

/**
 * Get an item by its ID.
 * @param id The primary key of the item to find.
 * @returns The item, or null if it wasn't found.
 */
export async function readById(id: number) : Promise<Item | null> {
  const model = await prisma.item.findFirst({ where: { id } });
  if (!model) {
    return null;
  }

  return createItemFromModel(model);
};

/**
 * Create a new item with the given information.
 * @param item Item category information.
 * @returns The created item category.
 */
export async function create(item: Item) : Promise<Item> {
  try {
    const model = await prisma.item.create({
      data: {
        createdAt: item.createdAt,
        name: item.name,
        createdByUserId: item.createdBy,
        categoryId: item.category,
        description: item.description
      }
    });

    return createItemFromModel(model);

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
 * Update properties in an item.
 * @param itemId Primary key of the item to update.
 * @param update Properties to update.
 * @returns The updated item, or null if it couldn't be found.
 */
export async function update(itemId: number, update: ItemUpdateParameters) : Promise<Item | null> {
  try {
    let updateData : Prisma.ItemUpdateInput = { };
    if (update.name !== undefined) {
      updateData.name = update.name;
    }
    if (update.description !== undefined) {
      updateData.description = update.description;
    }
    if (update.category !== undefined) {
      updateData.category = { connect: { id: update.category } };
    }
    
    const model = await prisma.item.update({
      where: { id: itemId },
      data: updateData
    });

    return createItemFromModel(model);
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
 * Delete an item and all it's stock items.
 * @param itemId Primary key of the item to delete.
 * @returns Whether or not the item was found and deleted.
 */
export async function remove(itemId: number) : Promise<boolean> {
  const { count } = await prisma.item.deleteMany({ where: { id: itemId } });
  return count > 0;
};

function createItemFromModel(model: any) : Item {
  return {
      id: model.id,
      name: model.name,
      description: model.description,
      category: model.categoryId,
      createdAt: model.createdAt,
      createdBy: model.createdByUserId
  };
}