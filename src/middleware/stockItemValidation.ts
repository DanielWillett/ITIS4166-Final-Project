import { body, oneOf, param, query } from "express-validator";

import { handleValidationErrors } from "./handleValidationErrors.js";

export const validateGetAllStockItems =
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
        .isIn([ "item", "manufacturer", "vendor", "location", "createdBy" ])
        .withMessage("'searchBy' parameter must be a valid property: [ item, manufacturer, vendor, location, createdBy ]."),
        
    query("search")
        .optional()
        .isString()
        .trim()
        .escape()
        .notEmpty({ ignore_whitespace: true })
        .withMessage("'search' parameter must be a valid string."),
    
    query("orderBy")
        .optional()
        .isIn([ "id", "item", "quantity", "manufacturer", "vendor", "url", "location", "createdBy", "createdAt" ])
        .withMessage("'orderBy' parameter must be a valid property: [ id, item, quantity, manufacturer, vendor, url, location, createdBy, createdAt ]."),

    query("sort")
        .optional()
        .toLowerCase()
        .isIn([ "asc", "desc" ])
        .withMessage("'sort' parameter must be either 'asc' or 'desc'."),

    handleValidationErrors
];

export const validateCreateStockItem =
[
    body("item")
        .exists({ values: 'null' })
        .withMessage("'item' parameter is required.")
        .isInt({ min: 1 })
        .withMessage("'item' parameter must be a positive integer value."),

    body("quantity")
        .exists({ values: 'null' })
        .withMessage("'quantity' parameter is required.")
        .isFloat({ min: 0.0 })
        .withMessage("'quantity' parameter must be a non-negative decimal value."),

    body("manufacturer")
        .optional({ values: "null" })
        .trim()
        .escape()
        .isString()
        .withMessage("'manufacturer' parameter must be a non-empty string value."),

    body("vendor")
        .optional({ values: "null" })
        .trim()
        .escape()
        .isString()
        .withMessage("'vendor' parameter must be a non-empty string value."),

    body("url")
        .optional({ values: "null" })
        .trim()
        .escape()
        .isString()
        .withMessage("'url' parameter must be a non-empty string value with a valid URL scheme."),

    body("location")
        .exists({ values: 'falsy' })
        .withMessage("'location' parameter is required.")
        .trim()
        .escape()
        .isString()
        .withMessage("'location' parameter must be a non-empty string value."),

    handleValidationErrors
];

export const validateGetStockItemById =
[
    param("id")
        .trim()
        .escape()
        .isInt({ min: 1 })
        .withMessage("'id' parameter must be an integer >= 1."),

    handleValidationErrors
];

export const validateUpdateStockItem =
[
    param("id")
        .trim()
        .escape()
        .isInt({ min: 1 })
        .withMessage("'id' parameter must be an integer >= 1."),

    oneOf(
        [
            body("quantity").exists(),
            body("manufacturer").exists(),
            body("vendor").exists(),
            body("url").exists(),
            body("location").exists(),
        ],
        {
            message: "At least one of the following fields must be updated: [ quantity, manufacturer, vendor, url, location ]."
        },
    ),

    body("quantity")
        .optional()
        .isFloat({ min: 0.0 })
        .withMessage("'quantity' parameter must be a non-negative decimal value."),

    body("manufacturer")
        .optional({ values: "null" })
        .trim()
        .escape()
        .isString()
        .withMessage("'manufacturer' parameter must be a non-empty string value."),

    body("vendor")
        .optional({ values: "null" })
        .trim()
        .escape()
        .isString()
        .withMessage("'vendor' parameter must be a non-empty string value."),

    body("url")
        .optional({ values: "null" })
        .trim()
        .escape()
        .isString()
        .withMessage("'url' parameter must be a non-empty string value with a valid URL scheme."),

    body("location")
        .optional()
        .trim()
        .escape()
        .isString()
        .withMessage("'location' parameter must be a non-empty string value."),

    handleValidationErrors
];

export const validateDeleteStockItem = validateGetStockItemById;