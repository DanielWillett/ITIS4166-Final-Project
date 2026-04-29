import { body, oneOf, param, query } from "express-validator";

import { handleValidationErrors } from "./handleValidationErrors.js";

export const validateGetAllUsers =
[
    query("offset")
        .optional()
        .isInt({ min: 0 })
        .withMessage("'offset' parameter must be an integer value >= 0."),
        
    query("limit")
        .optional()
        .isInt({ min: -1 })
        .withMessage("'limit' parameter must be an integer value >= -1."),

    query("searchBy")
        .optional()
        .isIn([ "username", "firstName", "lastName", "realName", "role" ])
        .withMessage("'searchBy' parameter must be a valid property: [ username, firstName, lastName, realName, role ]."),
        
    query("search")
        .optional()
        .isString()
        .trim()
        .escape()
        .notEmpty({ ignore_whitespace: true })
        .withMessage("'search' parameter must be a valid string."),
    
    query("orderBy")
        .optional()
        .isIn([ "id", "username", "firstName", "lastName", "createdBy", "createdAt", "role" ])
        .withMessage("'orderBy' parameter must be a valid property: [ id, username, firstName, lastName, createdBy, createdAt, role ]."),

    query("sort")
        .optional()
        .toLowerCase()
        .isIn([ "asc", "desc" ])
        .withMessage("'sort' parameter must be either 'asc' or 'desc'."),

    handleValidationErrors
];

export const validateGetUserById =
[
    param('id')
        .trim()
        .escape()
        .isInt({ min: 1 })
        .withMessage("'id' parameter must be an integer >= 1."),

    handleValidationErrors
];

export const validateUpdateUser =
[
    oneOf(
        [
            body("firstName").exists({ values: "falsy" }),
            body("lastName").exists({ values: "falsy" }),
            body("role").exists({ values: "falsy" }),
        ],
        {
            message: "At least one of the following fields must be updated: [ firstName, lastName, role ]."
        },
    ),

    body("firstName")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'firstName' parameter must be a non-empty string value."),

    body("lastName")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'lastName' parameter must be a non-empty string value."),

    body("role")
        .optional()
        .toLowerCase()
        .isIn([ "read", "write", "admin" ])
        .withMessage("'role' parameter must be one of: [ read, write, admin ]."),

    handleValidationErrors
];