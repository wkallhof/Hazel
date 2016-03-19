"use strict";

const NotFoundViewModel = require("../models/notFoundViewModel");

/**
 * Controller that handles 404 handling. Should be
 * one of the last controllers in the pipeline
 */
class NotFoundController {
    constructor(server, storageProvider) {
        this._server = server;
        this._storageProvider = storageProvider;

        this.bindRoutes();
    }

    bindRoutes() {
        // /[slug]
        this._server.get("/:slug", this.index.bind(this));
    }

    /**
     * Render the 404 page
     */
    index(req, res, next) {
        if (!req.params.slug) next();
        let viewModel = new NotFoundViewModel();

        viewModel.slug = req.params.slug;
        viewModel.title = this._storageProvider.slugToTitle(req.params.slug);

        res.render("404", viewModel);
    }
}

module.exports = NotFoundController;
