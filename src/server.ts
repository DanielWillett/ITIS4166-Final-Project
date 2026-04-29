import swagger from "swagger-ui-express";
import express from "express";
import yaml from "js-yaml";
import fs from "fs";

import HttpError from "./errors/NotFoundError.js";

// routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const PORT : number = parseInt(process.env.PORT ?? "3000");

const specs = yaml.load(fs.readFileSync("docs/openapi.yaml", "utf8"));

app.use(express.json());

app.use("/api-docs", swagger.serve, swagger.setup(specs!));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// throw not found error if route not matched
app.use((_, __, next) => {
    next(new HttpError("Not Found", 404));
});

// handle all uncaught errors
app.use((err: Error, _:  express.Request, res:  express.Response, __: express.NextFunction) => {
    if (err instanceof HttpError) {
        res.status(err.httpCode).json({ error: err.message });
    }
    else {
        console.error(err);
        res.status(500).json(err.message ?? "Internal Server Error");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));