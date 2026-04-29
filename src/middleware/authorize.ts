import type { Request, Response, NextFunction } from "express";

import HttpError from "../errors/NotFoundError.js";

export default function authorize(
    requires: "write" | "admin",
    adminIfNotOwningUser: boolean = false,
    getUserId: ((req: Request) => boolean) | null = null
) {
    return function (req: Request, _: Response, next: NextFunction) {
        
        if (!req.session) {
            throw new HttpError("Not authenticated. Provide an Authorization header with a bearer access token.", 401);
        }

        const role = req.session.user.role;

        if (requires === "write") {
            
            // if true, requires the user either be an admin or own the resource
            if (adminIfNotOwningUser) {
                const targetUser = getUserId ? getUserId(req) : parseInt(req.params.id!.toString());
                if (targetUser !== req.session.user.id && role !== "admin") {
                    return next(new HttpError("Unauthorized, requires administrator access or ownership of resource.", 403));
                }
            }

            if (role !== "write" && role !== "admin") {
                return next(new HttpError("Unauthorized, requires write access.", 403));
            }
        } else if (role !== "admin") {
            return next(new HttpError("Unauthorized, requires administrator access.", 403));
        }

        next();
    };
}