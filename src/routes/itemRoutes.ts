import express from "express";

import * as validators from '../middleware/itemValidation.js';
import * as handlers from '../controllers/itemController.js';
import authorize from "../middleware/authorize.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    validators.validateGetAllItems,
    handlers.getAllItemsHandler
);

router.post(
    "/",
    authenticate,
    validators.validateCreateItem,
    authorize("write"),
    handlers.createItemHandler
);

router.get(
    "/:id",
    authenticate,
    validators.validateGetItemById,
    handlers.getItemByIdHandler
);

router.patch(
    "/:id",
    authenticate,
    validators.validateUpdateItem,
    authorize("write"),
    handlers.updateItemHandler
);

router.delete(
    "/:id",
    authenticate,
    validators.validateDeleteItem,
    authorize("write"),
    handlers.deleteItemHandler
)

export default router;