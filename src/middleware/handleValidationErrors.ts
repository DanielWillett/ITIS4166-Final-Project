import { validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array();
    return res
      .status(400)
      .json({ errors: errorList.map(err => err.msg) });
  }
  
  next();
};