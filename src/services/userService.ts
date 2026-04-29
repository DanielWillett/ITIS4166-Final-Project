import * as repo from "../repositories/userRepo.js";
import type User from "../types/user.js";
import type { UserQueryOptions } from "../types/userQueryOptions.js";

export function getUser(id: number) : Promise<User | null> {
    return repo.readById(id);
};

export function getUsers(options: UserQueryOptions) : Promise<User[]> {
    return repo.readMany(options);
};

export function findUser(username: string) : Promise<{ user: User, passwordHash: string } | null> {
    return repo.readByUsername(username);
};

export function createUser(user: User, passwordHash: string) : Promise<User> {
    return repo.create(user, passwordHash);
};

export function updateUser(userId: number, update: repo.UserUpdateParameters) : Promise<User | null> {
    return repo.update(userId, update);
};