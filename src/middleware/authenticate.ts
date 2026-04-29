import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

import * as users from "../services/userService.js"; 
import HttpError from "../errors/NotFoundError.js";

export default async function authenticate(req: Request, _: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new HttpError("Unable to authenticate, missing bearer token.", 401));
    }

    const token = authHeader.substring(7);
    try {
        const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
        if (!payload.id) {
            return next(new HttpError("Unable to authenticate, invalid bearer token.", 401));
        }

        const user = await users.getUser(payload.id);
        if (!user) {
            return next(new HttpError("Unable to authenticate, user deleted since login.", 401));
        }

        req.session = { user: user };
    }
    catch (err: any) {
        if (err.name === "TokenExpiredError") {
            return next(new HttpError("Unable to authenticate, bearer token expired.", 401))
        } else {
            console.log("Error authenticating user:");
            console.log(err);
            return next(new HttpError("Unable to authenticate, malformed bearer token.", 401));
        }
    }
    
    next();
}