import { body, oneOf, param, query } from "express-validator";

import { handleValidationErrors } from "./handleValidationErrors.js";

export const validateGetAllCategories =
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
        .isIn([ "name", "parent", "createdBy" ])
        .withMessage("'searchBy' parameter must be a valid property: [ name, parent, createdBy ]."),
        
    query("search")
        .optional()
        .isString()
        .trim()
        .escape()
        .notEmpty({ ignore_whitespace: true })
        .withMessage("'search' parameter must be a valid string."),
    
    query("orderBy")
        .optional()
        .isIn([ "id", "name", "parent", "createdBy", "createdAt" ])
        .withMessage("'orderBy' parameter must be a valid property: [ id, name, parent, createdBy, createdAt ]."),

    query("sort")
        .optional()
        .toLowerCase()
        .isIn([ "asc", "desc" ])
        .withMessage("'sort' parameter must be either 'asc' or 'desc'."),

    handleValidationErrors
];

export const validateCreateCategory =
[
    body("name")
        .trim()
        .escape()
        .isString()
        .withMessage("'name' parameter must be a non-empty string value."),

    body("parent")
        .optional({ values: "null" })
        .isInt({ min: 1 })
        .withMessage("'parent' parameter must be a valid integer if included."),

    handleValidationErrors
];

export const validateGetCategoryById =
[
    param("id")
        .trim()
        .escape()
        .isInt({ min: 1 })
        .withMessage("'id' parameter must be an integer >= 1."),

    handleValidationErrors
];

export const validateUpdateCategory =
[
    param("id")
        .trim()
        .escape()
        .isInt({ min: 1 })
        .withMessage("'id' parameter must be an integer >= 1."),

    oneOf(
        [
            body("name").exists({ values: "falsy" }),
            body("parent").exists({ values: "undefined" }),
        ],
        {
            message: "At least one of the following fields must be updated: [ name, parent ]."
        },
    ),

    body("name")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'name' parameter must be a non-empty string value."),

    body("parent")
        .isInt({ min: 1 })
        .optional({ values: "null" })
        .withMessage("'parent' parameter must be a valid integer or 'null'."),

    handleValidationErrors
];

export const validateDeleteCategory = validateGetCategoryById;