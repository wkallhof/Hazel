"use strict";

const SearchViewModel = require("../models/searchViewModel");

class SearchController {
    constructor(server, config, authMethod, searchProvider) {
        this._server = server;
        this._config = config;
        this._auth = authMethod;
        this._searchProvider = searchProvider;

        this._bindRoutes();
    }

    _bindRoutes() {
        // /search
        this._server.get("/search", this._auth, this.index.bind(this));
    }

    /**
     * Render the search page
     */
    index(req, res, next) {
        var viewModel = new SearchViewModel();

        if (req.query.s) {
            let term = decodeURIComponent(req.query.s);
            viewModel.searchTerm = term;
            viewModel.searchResults = this._searchProvider.search(term);
        }

        viewModel.config = this._config;

        res.render("search", viewModel);
    }
}

module.exports = SearchController;
