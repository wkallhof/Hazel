"use strict";

const basic_auth = require("basic-auth");

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