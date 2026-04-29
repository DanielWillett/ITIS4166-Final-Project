import express from "express";

import * as validators from '../middleware/authValidation.js';
import * as handlers from '../controllers/authController.js';
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.post(
    "/create-user",
    authenticate,
    authorize("admin"),
    validators.validateCreateUser,
    handlers.signUpHandler
);

router.post(
    "/login",
    validators.validateLogIn,
    handlers.logInHandler
);

export default router;