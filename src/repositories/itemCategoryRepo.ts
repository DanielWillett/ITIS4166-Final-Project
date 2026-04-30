import type { DefaultArgs } from "@prisma/client/runtime/client";

import prisma from '../db.js';
import type { ItemCategoryQueryOptions } from "../types/itemCategoryQueryOptions.js";
import type ItemCategory from "../types/ItemCategory.js";
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
    if (!options.searchBy || options.searchBy === "realName") {
      // search by real name
      const nameIndex = options.search.indexOf(" ");
      if (nameIndex > 0 && nameIndex < options.search.length - 1) {
        const firstName = options.search.substring(0, nameIndex).trim();
        const lastName = options.search.substring(nameIndex + 1).trim();
        conditions.firstName = { contains: firstName, mode: "insensitive" };
        conditions.lastName = { contains: lastName, mode: "insensitive" };
      } else {
        conditions.OR = [
          { firstName: { contains: options.search, mode: "insensitive" } },
          { lastName: { contains: options.search, mode: "insensitive" } }
        ];
      }
    }
    else if (options.searchBy === "createdBy") {
      // search by creating ItemCategory
      const createdById = parseInt(options.search);
      if (!isNaN(createdById)) {
        conditions.createdByItemCategoryId = createdById;
      } else {
        throw new HttpError("Expected integer value for createdBy search parameter.", 400);
      }
    } else {
      // search by other field
      conditions[options.searchBy] = { contains: options.search, mode: "insensitive" };
    }
  }

  let query: Prisma.ItemCategoryFindManyArgs<DefaultArgs> = {
    where: conditions,
    omit: { passwordHash: true }
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

  const models = await prisma.ItemCategory.findMany(query);
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
    const data : Prisma.ItemCategoryUncheckedCreateInput = {
      createdAt: category.createdAt,
      name: category.name,
      createdByUserId: category.createdById,
      parentId: undefined // todo: migrate
    };

    if (category.parentId !== null) {
      data.parentId = category.parentId;
    }
    const u = await prisma.itemCategory.create({
      data: data
    });

    return {
      id: u.id,
      createdAt: u.createdAt,
      firstName: u.firstName,
      lastName: u.lastName,
      ItemCategoryname: u.ItemCategoryname,
      createdById: u.createdByItemCategoryId,
      role: u.role
    };

  } catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError)) {
      throw err;
    }

    if (err.code === "P2002") {
      // unique constraint error
      throw new HttpError("ItemCategoryname already used.", 409);
    }
    else if (err.code === "P2004") {
      // constraint error
      throw new HttpError("Invalid createdBy ItemCategory ID.", 400);
    }
    else {
      throw err;
    }

  }
};

export async function update(categoryId: number, update: CategoryUpdateParameters) : Promise<ItemCategory | null> {
  try {
    let updateData : Prisma.ItemCategoryUpdateInput = { };
    if (update.name !== undefined) {
      updateData.name = update.name;
    }
    if (update.parent !== undefined) {
      if (update.parent !== null) {
        updateData.parent = { connect: { id: update.parent } };
      } else {
        updateData.parent = { disconnect: true };
      }
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

function createItemCategoryFromModel(u: any) : ItemCategory {
  return {
      id: u.id,
      name: u.name,
      parentId: u.parentId,
      createdAt: u.createdAt,
      createdById: u.createdByItemCategoryId
  };
}