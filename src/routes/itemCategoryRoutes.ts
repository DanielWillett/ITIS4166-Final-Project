import express from "express";

import * as validators from '../middleware/itemCategoryValidation.js';
import * as handlers from '../controllers/itemCategoryController.js';
import authorize from "../middleware/authorize.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    validators.validateGetAllCategories,
    handlers.getAllCategoriesHandler
);

router.post(
    "/",
    authenticate,
    validators.validateCreateCategory,
    authorize("write"),
    handlers.createCategoryHandler
);

router.get(
    "/:id",
    authenticate,
    validators.validateGetCategoryById,
    handlers.getCategoryByIdHandler
);

router.patch(
    "/:id",
    authenticate,
    validators.validateUpdateCategory,
    authorize("write"),
    handlers.updateCategoryHandler
);

router.delete(
    "/:id",
    authenticate,
    validators.validateDeleteCategory,
    authorize("write"),
    handlers.deleteCategoryHandler
)

export default router;