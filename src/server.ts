import swagger from "swagger-ui-express";
import express from "express";
import yaml from "js-yaml";
import fs from "fs";

import HttpError from "./errors/NotFoundError.js";

// routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/itemCategoryRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import stockItemRoutes from "./routes/stockItemRoutes.js";
import stockItemRecordRoutes from "./routes/stockItemRecordRoutes.js";

const app = express();
const PORT : number = parseInt(process.env.PORT ?? "3000");

const specs = yaml.load(fs.readFileSync("docs/openapi.yaml", "utf8"));

app.use(express.json());

app.use("/api-docs", swagger.serve, swagger.setup(specs!));
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/item-categories", categoryRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/stock-items", stockItemRoutes);
app.use("/api/stock-item-records", stockItemRecordRoutes);
app.get("/health", (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// throw not found error if route not matched
app.use((_, __, next) => {
    next(new HttpError("Not Found", 404));
});

// handle all uncaught errors
app.use((err: Error, _:  express.Request, res:  express.Response, __: express.NextFunction) => {
    if (err instanceof HttpError) {
        if (err.httpCode === 400) {
            res.status(400).json({ errors: [ err.message ] });
        } else {
            res.status(err.httpCode).json({ error: err.message });
        }
    }
    else {
        console.error(err);
        res.status(500).json({ error: err.message ?? "Internal Server Error" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));