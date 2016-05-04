"use strict";

const basic_auth = require("basic-auth");

// define route paths that require admin access
const ADMIN_ROUTES = [
    "new",      // create new document
    "save",     // save document
    "edit",     // edit document
    "delete",   // delete document
    "sync"      // sync document
];

/**
 * Handles all authentication related tasks.
 */
class AuthenticationProvider {

    constructor(config) {
        this._config = config;
    }

    authenticate(req, res, next) {
        // first check if we need to authenticate
        if (!this._config.authentication) {
            return next();
        }

        // if authmode restricts only admin routes
        if (this._config.authentication_mode === "admin") {
            // if we are navigating not to an admin route then skip authcheck
            var action = req.url.substr(req.url.lastIndexOf("/") + 1);
            if (ADMIN_ROUTES.indexOf(action) === -1) {
                return next();
            }
        }

        // if so, use basic auth
        let user = basic_auth(req);

        // check user info
        if (!user || !user.name || !user.pass ||
            user.name !== this._config.credentials.username ||
            user.pass !== this._config.credentials.password) {
            return this._unauthorized(req, res, next);
        }

        // we are good, move on
        return next();
    }

    /**
     * Handles the response for when the current user
     * is not authorized
     */
    _unauthorized(req, res, next) {
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", "Basic realm=Authorization Required");
        res.end("Access denied");
        return;
    }
}

module.exports = AuthenticationProvider;