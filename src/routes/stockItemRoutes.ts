import express from "express";

import * as validators from '../middleware/stockItemValidation.js';
import * as handlers from '../controllers/stockItemController.js';
import authorize from "../middleware/authorize.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    validators.validateGetAllStockItems,
    handlers.getAllStockItemsHandler
);

router.post(
    "/",
    authenticate,
    validators.validateCreateStockItem,
    authorize("write"),
    handlers.createStockItemHandler
);

router.get(
    "/:id",
    authenticate,
    validators.validateGetStockItemById,
    handlers.getStockItemByIdHandler
);

router.patch(
    "/:id",
    authenticate,
    validators.validateUpdateStockItem,
    authorize("write"),
    handlers.updateStockItemHandler
);

router.delete(
    "/:id",
    authenticate,
    validators.validateDeleteStockItem,
    authorize("write"),
    handlers.deleteStockItemHandler
)

export default router;