import type { DefaultArgs } from "@prisma/client/runtime/client";

import prisma from '../db.js';
import type { StockItemQueryOptions } from "../types/stockItemQueryOptions.js";
import type StockItem from "../types/stockItem.js";
import { Prisma } from "../generated/prisma/index.js";
import HttpError from "../errors/NotFoundError.js";

export interface StockItemUpdateParameters {
    quantity: number | undefined,
    manufacturer: string | null | undefined,
    vendor: string | null | undefined,
    url: string | null | undefined,
    location: string | undefined
}

/**
 * Query the entire stock item list.
 * @param options Query filters and sort options.
 * @returns An array of found stock items.
 */
export async function readMany(options: StockItemQueryOptions) : Promise<StockItem[]> {
  let conditions : Prisma.StockItemWhereInput = {};

  if (options.search) {
    if (!options.searchBy || options.searchBy === "item" || options.searchBy === "createdBy") {
      // search by creating User or item
      const id = parseInt(options.search);
      if (!isNaN(id)) {
        if (!options.searchBy || options.searchBy === "item") {
          conditions.itemId = id;
        } else {
          conditions.createdByUserId = id;
        }
      } else {
        throw new HttpError(`Expected integer value for ${options.searchBy ?? "item"} search parameter.`, 400);
      }
    } else {
      // search by other field
      conditions[options.searchBy] = { contains: options.search, mode: "insensitive" };
    }
  }

  let query: Prisma.StockItemFindManyArgs<DefaultArgs> = {
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

  const models = await prisma.stockItem.findMany(query);
  return models.map(createStockItemFromModel);
};

/**
 * Get a stock item by its ID.
 * @param id The primary key of the stock item to find.
 * @returns The stock item, or null if it wasn't found.
 */
export async function readById(id: number) : Promise<StockItem | null> {
  const model = await prisma.stockItem.findFirst({ where: { id } });
  if (!model) {
    return null;
  }

  return createStockItemFromModel(model);
};

/**
 * Create a new stock item with the given information.
 * @param stockItem Stock item category information.
 * @returns The created Stockitem category.
 */
export async function create(stockItem: StockItem) : Promise<StockItem> {
  try {
    const model = await prisma.stockItem.create({
      data: {
        createdAt: stockItem.createdAt,
        createdByUserId: stockItem.createdBy,
        itemId: stockItem.item,
        quantity: stockItem.quantity,
        manufacturer: stockItem.manufacturer,
        vendor: stockItem.vendor,
        url: stockItem.url,
        location: stockItem.location
      }
    });

    return createStockItemFromModel(model);

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
 * Update properties in a stock item.
 * @param stockItemId Primary key of the stock item to update.
 * @param update Properties to update.
 * @returns The updated stock item, or null if it couldn't be found.
 */
export async function update(stockItemId: number, update: StockItemUpdateParameters) : Promise<StockItem | null> {
  try {
    let updateData : Prisma.StockItemUpdateInput = { };
    if (update.quantity !== undefined) {
      updateData.quantity = update.quantity;
    }
    if (update.manufacturer !== undefined) {
      updateData.manufacturer = update.manufacturer;
    }
    if (update.vendor !== undefined) {
      updateData.vendor = update.vendor;
    }
    if (update.url !== undefined) {
      updateData.url = update.url;
    }
    if (update.location !== undefined) {
      updateData.location = update.location;
    }
    
    const model = await prisma.stockItem.update({
      where: { id: stockItemId },
      data: updateData
    });

    return createStockItemFromModel(model);
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
 * Delete a stock item and all it's stock stock items.
 * @param stockItemId Primary key of the stock item to delete.
 * @returns Whether or not the stock item was found and deleted.
 */
export async function remove(stockItemId: number) : Promise<boolean> {
  const { count } = await prisma.stockItem.deleteMany({ where: { id: stockItemId } });
  return count > 0;
};

function createStockItemFromModel(model: any) : StockItem {
  return {
      id: model.id,
      item: model.itemId,
      quantity: model.quantity,
      manufacturer: model.manufacturer,
      vendor: model.vendor,
      url: model.url,
      location: model.location,
      createdAt: model.createdAt,
      createdBy: model.createdByUserId
  };
}