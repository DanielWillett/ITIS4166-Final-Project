import { body } from "express-validator";

import { handleValidationErrors } from "./handleValidationErrors.js";

export const validateLogIn =
[
    body("username")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'username' parameter must be a non-empty string value."),

    body("password")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'password' parameter must be a non-empty string value."),

    handleValidationErrors
];

export const validateCreateUser =
[
    body("username")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'username' parameter must be a non-empty string value."),

    body("password")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'password' parameter must be a non-empty string value."),

    body("role")
        .optional()
        .isIn([ "read", "write", "admin" ])
        .withMessage("'role' parameter must be one of: [ read, write, admin ]."),

    handleValidationErrors
];