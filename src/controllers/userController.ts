import type { NextFunction, Request, Response } from "express";

import type { UserQueryOptions } from "../types/userQueryOptions.js";
import * as userService from "../services/userService.js";
import HttpError from "../errors/NotFoundError.js";
import { parseQueryOptions } from "../types/queryOptions.js";

export async function getAllUsersHandler(req : Request, res : Response) : Promise<void> {
    const options : UserQueryOptions = parseQueryOptions(req)
    const results = await userService.getUsers(options);
    res.status(200).json(results);
};

export async function getUserByIdHandler(req : Request, res : Response, next : NextFunction) {
    const userId = parseInt(req.params.id!.toString());
    const user = await userService.getUser(userId);

    if (!user) {
        return next(new HttpError(`User ${userId} not found.`, 404));
    }

    res.status(200).json(user);
};

export async function updateUserHandler(req : Request, res : Response, next : NextFunction) {
    const userId = parseInt(req.params.id!.toString());
    let update : any = { };
    if (typeof req.body.firstName === "string") {
        update.firstName = req.body.firstName;
    }
    if (typeof req.body.lastName === "string") {
        update.lastName = req.body.lastName;
    }
    if (req.body.role === "read" || req.body.role === "write" || req.body.role === "admin") {
        let role : "read" | "write" | "admin" = req.body.role;
        if (role !== "read") {
            // clamp role to user's role
            if (role === "write") {
                if (req.session!.user.role === "read") {
                    return next(new HttpError("Can not set role to 'write', logged in user must have write permissions.", 403));
                }
            } else if (role === "admin") {
                if (req.session!.user.role !== "admin") {
                    return next(new HttpError("Can not set role to 'admin', logged in user must also be an administrator.", 403));
                }
            } else {
                // shouldn't happen
                return next(new HttpError("Invalid role.", 400));
            }
        }
        
        update.role = role;
    }

    const user = await userService.updateUser(userId, update);
    if (!user) {
        return next(new HttpError(`User ${userId} not found.`, 404));
    }

    res.status(200).json(user);
};