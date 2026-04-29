import type User from "./user.js";

/**
 * Information about a request's authentication.
 */
export default class Session {
    
    user: User;

    constructor(user: User) {
        this.user = user;
    }
}