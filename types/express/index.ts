import type Session from "../../src/types/session.js";

// add properties to requests
// https://stackoverflow.com/a/66714317

declare module 'express-serve-static-core' {
    interface Request {
        session?: Session
    }
}