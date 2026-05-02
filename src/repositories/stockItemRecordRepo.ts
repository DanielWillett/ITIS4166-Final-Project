import type { DefaultArgs } from "@prisma/client/runtime/client";

import prisma from '../db.js';
import type { StockItemRecordQueryOptions } from "../types/stockItemRecordQueryOptions.js";
import type StockItemRecord from "../types/stockItemRecord.js";
import { Prisma } from "../generated/prisma/index.js";
import HttpError from "../errors/NotFoundError.js";

/**
 * Query the entire stock item record list.
 * @param options Query filters and sort options.
 * @returns An array of found stock item records.
 */
export async function readMany(options: StockItemRecordQueryOptions) : Promise<StockItemRecord[]> {
  let conditions : Prisma.StockItemRecordWhereInput = {};

  if (options.search) {
    if (!options.searchBy) {
      conditions.description = { contains: options.search, mode: "insensitive" };
    } else if (options.searchBy === "fieldId" || options.searchBy === "user" || options.searchBy === "stockItem") {
      // search by field ID or user or stock item
      const id = parseInt(options.search);
      if (!isNaN(id)) {
        if (options.searchBy === "fieldId") {
          conditions.fieldId = id;
        } else if (options.searchBy === "user") {
          conditions.userId = id;
        } else {
          conditions.stockItemId = id;
        }
      } else {
        throw new HttpError(`Expected integer value for ${options.searchBy} search parameter.`, 400);
      }
    } else {
      // search by other field
      conditions[options.searchBy] = { contains: options.search, mode: "insensitive" };
    }
  }

  let query: Prisma.StockItemRecordFindManyArgs<DefaultArgs> = {
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

  const models = await prisma.stockItemRecord.findMany(query);
  return models.map(createStockItemRecordFromModel);
};

/**
 * Get a stock item record by its ID.
 * @param id The primary key of the stock item record to find.
 * @returns The stock item record, or null if it wasn't found.
 */
export async function readById(id: number) : Promise<StockItemRecord | null> {
  const model = await prisma.stockItemRecord.findFirst({ where: { id } });
  if (!model) {
    return null;
  }

  return createStockItemRecordFromModel(model);
};

/**
 * Create a new stock item with the given information.
 * @param stockItemRecord Stock item category information.
 * @returns The created stockItemRecord category.
 */
export async function create(stockItemRecord: StockItemRecord) : Promise<StockItemRecord> {
  try {
    const model = await prisma.stockItemRecord.create({
      data: {
        timestamp: stockItemRecord.timestamp,
        userId: stockItemRecord.user,
        stockItemId: stockItemRecord.stockItem,
        description: stockItemRecord.description,
        oldValue: stockItemRecord.oldValue,
        fieldId: stockItemRecord.fieldId
      }
    });

    return createStockItemRecordFromModel(model);

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

function createStockItemRecordFromModel(model: any) : StockItemRecord {
  return {
      id: model.id,
      stockItem: model.stockItemId,
      fieldId: model.fieldId,
      description: model.description,
      oldValue: model.oldValue,
      user: model.userId,
      timestamp: model.timestamp
  };
}