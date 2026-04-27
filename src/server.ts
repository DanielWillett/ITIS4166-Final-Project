import express from "express";
import yaml from "js-yaml";
import fs from "fs";
import swagger from "swagger-ui-express";
import HttpError from "./errors/NotFoundError.js";

const app = express();
const PORT : number = parseInt(process.env.PORT ?? "3000");

const specs = yaml.load(fs.readFileSync("docs/openapi.yaml", "utf8"));

app.use("/api-docs", swagger.serve, swagger.setup(specs!));

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
        res.status(500).json(err.message ?? "Internal Server Error");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}.`));