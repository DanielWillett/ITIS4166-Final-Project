import express from "express";

import * as validators from '../middleware/userValidation.js';
import * as handlers from '../controllers/userController.js';
import authorize from "../middleware/authorize.js";
import authenticate from "../middleware/authenticate.js";


const router = express.Router();

router.get(
    "/",
    authenticate,
    validators.validateGetAllUsers,
    handlers.getAllUsersHandler
);

router.get(
    "/:id",
    authenticate,
    validators.validateGetUserById,
    handlers.getUserByIdHandler
);

router.patch(
    "/:id",
    authenticate,
    validators.validateUpdateUser,
    authorize("write", true),
    handlers.updateUserHandler
);

export default router;