"use strict";

const SearchViewModel = require("../models/searchViewModel");

class SearchController {
    constructor(server, searchProvider) {
        this._server = server;
        this._searchProvider = searchProvider;

        this.bindRoutes();
    }

    bindRoutes() {
        // /search
        this._server.get("/search", this.index.bind(this));
    }

    /**
     * Render the search page
     */
    index(req, res, next) {
        var viewModel = new SearchViewModel();

        if (req.query.s) {
            let term = decodeURIComponent(req.query.s);
            viewModel.searchTerm = term;
            viewModel.results = this._searchProvider.search(term);
        }

        res.render("search", viewModel);
    }
}

module.exports = SearchController;
