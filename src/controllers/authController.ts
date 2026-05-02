import type { Request, Response } from "express";

import { createNewUser, login } from "../services/authService.js";
import HttpError from "../errors/NotFoundError.js";

export async function signUpHandler(req: Request, res: Response) : Promise<void> {

    let role : "read" | "write" | "admin" = req.body.role ?? "read";
    if (role !== "read") {
        // clamp role to user's role
        if (role === "write") {
            if (req.session!.user.role === "read")
                role = "read";
        } else if (role === "admin") {
            if (req.session!.user.role !== "admin")
                role = req.session!.user.role === "write" ? "write" : "read";
        } else {
            role = "read";
        }
    }
    
    try {
        const user = await createNewUser(
            req.body.username,
            req.body.password,
            req.body.firstName,
            req.body.lastName,
            req.session!.user.id,
            role
        );

        res.status(201).json(user);
    }
    catch (err) {
        // catches foreign key error when createdBy doesn't exist.
        if (err instanceof HttpError && err.httpCode === 400) {
            throw new HttpError("Unable to authenticate, user deleted since login.", 401);
        }

        throw err;
    }
};

export async function logInHandler(req: Request, res: Response) : Promise<void> {
    const info = await login(req.body.username, req.body.password);
    req.session = { 
        user: info.user
    };

    res.status(200).json({
        token: info.token
    });
};