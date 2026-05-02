import { body, oneOf, param, query } from "express-validator";

import { handleValidationErrors } from "./handleValidationErrors.js";

export const validateGetAllItems =
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
        .isIn([ "name", "description", "createdBy", "category" ])
        .withMessage("'searchBy' parameter must be a valid property: [ name, description, createdBy, category ]."),
        
    query("search")
        .optional()
        .isString()
        .trim()
        .escape()
        .notEmpty({ ignore_whitespace: true })
        .withMessage("'search' parameter must be a valid string."),
    
    query("orderBy")
        .optional()
        .isIn([ "id", "name", "description", "category", "createdBy", "createdAt" ])
        .withMessage("'orderBy' parameter must be a valid property: [ id, name, description, category, createdBy, createdAt ]."),

    query("sort")
        .optional()
        .toLowerCase()
        .isIn([ "asc", "desc" ])
        .withMessage("'sort' parameter must be either 'asc' or 'desc'."),

    handleValidationErrors
];

export const validateCreateItem =
[
    body("name")
        .exists({ values: 'falsy' })
        .withMessage("'name' parameter is required.")
        .trim()
        .escape()
        .isString()
        .withMessage("'name' parameter must be a non-empty string value."),

    body("description")
        .exists({ values: 'falsy' })
        .withMessage("'description' parameter is required.")
        .trim()
        .escape()
        .isString()
        .withMessage("'description' parameter must be a non-empty string value."),

    body("category")
        .exists({ values: 'null' })
        .withMessage("'category' parameter is required.")
        .isInt({ min: 1 })
        .withMessage("'category' parameter must be a valid integer."),

    handleValidationErrors
];

export const validateGetItemById =
[
    param("id")
        .trim()
        .escape()
        .isInt({ min: 1 })
        .withMessage("'id' parameter must be an integer >= 1."),

    handleValidationErrors
];

export const validateUpdateItem =
[
    param("id")
        .trim()
        .escape()
        .isInt({ min: 1 })
        .withMessage("'id' parameter must be an integer >= 1."),

    oneOf(
        [
            body("name").exists({ values: "falsy" }),
            body("description").exists({ values: "falsy" }),
            body("category").exists({ values: "undefined" }),
        ],
        {
            message: "At least one of the following fields must be updated: [ name, description, category ]."
        },
    ),

    body("name")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'name' parameter must be a non-empty string value."),

    body("description")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'description' parameter must be a non-empty string value."),

    body("category")
        .optional({ values: "null" })
        .isInt({ min: 1 })
        .withMessage("'category' parameter must be a valid integer."),

    handleValidationErrors
];

export const validateDeleteItem = validateGetItemById;