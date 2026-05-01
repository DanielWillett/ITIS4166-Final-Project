import type { DefaultArgs } from "@prisma/client/runtime/client";

import prisma from '../db.js';
import type { UserQueryOptions } from "../types/userQueryOptions.js";
import type User from "../types/user.js";
import { Prisma } from "../generated/prisma/index.js";
import HttpError from "../errors/NotFoundError.js";

export interface UserUpdateParameters {
    firstName: string | undefined,
    lastName: string | undefined,
    role: "read" | "write" | "admin" | undefined
}

/**
 * Query the entire user list.
 * @param options Query filters and sort options.
 * @returns An array of found users.
 */
export async function readMany(options: UserQueryOptions) : Promise<User[]> {
  let conditions : Prisma.UserWhereInput = {};

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
      // search by creating user
      const createdById = parseInt(options.search);
      if (!isNaN(createdById)) {
        conditions.createdByUserId = createdById;
      } else {
        throw new HttpError("Expected integer value for createdBy search parameter.", 400);
      }
    } else {
      // search by other field
      conditions[options.searchBy] = { contains: options.search, mode: "insensitive" };
    }
  }

  let query: Prisma.UserFindManyArgs<DefaultArgs> = {
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

  const models = await prisma.user.findMany(query);
  return models.map(createUserFromModel);
};

/**
 * Get a user by their user ID.
 * @param id The primary key of the user to find.
 * @returns The user, or null if the user was not found.
 */
export async function readById(id: number) : Promise<User | null> {
  const model = await prisma.user.findFirst({ where: { id } });
  if (!model) {
    return null;
  }

  return createUserFromModel(model);
};

/**
 * Get a user and their password hash by their username.
 * @param username The username of the user to find.
 * @returns The user and their bcrypt password hash, or null if the user was not found.
 */
export async function readByUsername(username: string) : Promise<{ user: User, passwordHash: string } | null> {
  const model = await prisma.user.findFirst({ where: { username } });
  if (!model) {
    return null;
  }

  const user = createUserFromModel(model);
  return { user, passwordHash: model.passwordHash };
};

/**
 * Create a new user with the given information.
 * @param user User information.
 * @param passwordHash bcrypt hash of the user's password.
 * @returns The created user.
 */
export async function create(user: User, passwordHash: string) : Promise<User> {
  try {
    const u = await prisma.user.create({
      data: {
        createdAt: user.createdAt,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        passwordHash: passwordHash,
        createdByUserId: user.createdById,
        role: user.role
      },
      omit: { passwordHash: true }
    });

    return createUserFromModel(u);

  } catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError)) {
      throw err;
    }

    if (err.code === "P2002") {
      // unique constraint error
      throw new HttpError("Username already used.", 409);
    }
    else if (err.code === "P2004") {
      // constraint error
      throw new HttpError("Invalid createdBy User ID.", 400);
    }
    else {
      throw err;
    }

  }
};

/**
 * Update properties in a user.
 * @param categoryId Primary key of the user to update.
 * @param update Properties to update.
 * @returns The updated user, or null if it couldn't be found.
 */
export async function update(userId: number, update: UserUpdateParameters) : Promise<User | null> {
  try {
    let updateData : Prisma.UserUpdateInput = { };
    if (update.firstName !== undefined) {
      updateData.firstName = update.firstName;
    }
    if (update.lastName !== undefined) {
      updateData.lastName = update.lastName;
    }
    if (update.role !== undefined) {
      updateData.role = update.role;
    }
    
    const model = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      omit: { passwordHash: true }
    });

    return createUserFromModel(model);
  }
  catch (err) {
    if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2025") {
      throw err;
    }

    // P2025 = not found error
    return null;
  }
};

/**
 * Delete a user.
 * @param userId Primary key of the user to delete.
 * @returns Whether or not the user was found and deleted.
 */
export async function remove(userId: number) : Promise<boolean> {
  const { count } = await prisma.user.deleteMany({ where: { id: userId } });
  return count > 0;
};

function createUserFromModel(u: any) : User {
  return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      createdById: u.createdByUserId,
      createdAt: u.createdAt,
      role: u.role
  };
}