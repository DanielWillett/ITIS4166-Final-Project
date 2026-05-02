import { param, query } from "express-validator";

import { handleValidationErrors } from "./handleValidationErrors.js";

export const validateGetAllStockItemRecords =
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
        .isIn([ "stockItem", "fieldId", "description", "oldValue", "user" ])
        .withMessage("'searchBy' parameter must be a valid property: [ stockItem, fieldId, description, oldValue, user ]."),
        
    query("search")
        .optional()
        .isString()
        .trim()
        .escape()
        .notEmpty({ ignore_whitespace: true })
        .withMessage("'search' parameter must be a valid string."),
    
    query("orderBy")
        .optional()
        .isIn([ "id", "stockItem", "fieldId", "description", "oldValue", "user", "timestamp" ])
        .withMessage("'orderBy' parameter must be a valid property: [ id, stockItem, fieldId, description, oldValue, user, timestamp ]."),

    query("sort")
        .optional()
        .toLowerCase()
        .isIn([ "asc", "desc" ])
        .withMessage("'sort' parameter must be either 'asc' or 'desc'."),

    handleValidationErrors
];

export const validateGetStockItemRecordById =
[
    param("id")
        .trim()
        .escape()
        .isInt({ min: 1 })
        .withMessage("'id' parameter must be an integer >= 1."),

    handleValidationErrors
];