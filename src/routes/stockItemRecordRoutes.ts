import express from "express";

import * as validators from '../middleware/stockItemRecordValidation.js';
import * as handlers from '../controllers/stockItemRecordController.js';
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get(
    "/",
    authenticate,
    validators.validateGetAllStockItemRecords,
    handlers.getAllStockItemRecordsHandler
);

router.get(
    "/:id",
    authenticate,
    validators.validateGetStockItemRecordById,
    handlers.getStockItemRecordByIdHandler
);

export default router;