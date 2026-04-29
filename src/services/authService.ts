import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

import * as users from "./userService.js";
import type User from "../types/user.js";
import HttpError from "../errors/NotFoundError.js";

const SALT_ROUNDS = 10; // also update seed.ts

/**
 * Contents that should be given in a token.
 */
export interface AuthTokenData {
    id: number,
    role: "read" | "write" | "admin"
}

/**
 * Create a new user with a plain-text password.
 * @returns The newly created user.
 */
export async function createNewUser(username: string, password: string, firstName: string, lastName: string, createdBy: number | null = null, role: "read" | "write" | "admin" = "read") : Promise<User> {

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await users.createUser({
        createdAt: new Date(Date.now()),
        createdById: createdBy,
        firstName: firstName,
        lastName: lastName,
        username: username,
        id: -1,
        role: role
    }, hash);

    return user;
};

/**
 * Log into a user and create a JWT for their session.
 * @returns Their session token and newly created user.
 */
export async function login(username: string, password: string) : Promise<{ user: User, token: string }>
{
    const userInfo = await users.findUser(username);
    if (!userInfo || !(await bcrypt.compare(password, userInfo.passwordHash))) {
        throw new HttpError("Invalid credentials.", 401);
    }
    
    const data: AuthTokenData = { 
        id: userInfo.user.id,
        role: userInfo.user.role
    };

    const token = jwt.sign(data, process.env.JWT_SECRET!, { expiresIn: (process.env.JWT_EXPIRES_IN as StringValue) ?? 3600 });
    return { token: token, user: userInfo.user };
};