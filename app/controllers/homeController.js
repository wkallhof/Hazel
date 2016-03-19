"use strict";

const HomeViewModel = require("../models/homeViewModel");
const _ = require("lodash");

class HomeController {
    constructor(server, documentRepository, searchProvider, analyticsService) {
        this._documents = documentRepository;
        this._server = server;
        this._searchProvider = searchProvider;
        this._analyticsService = analyticsService;

        this.bindRoutes();
    }

    bindRoutes() {
        // /
        this._server.get("/", this.index.bind(this));
    }

    /**
     * Render the homepage
     */
    index(req, res, next) {
        var viewModel = new HomeViewModel();

        viewModel.popularSearches = this._searchProvider.getPopularSearchTerms(5);
        viewModel.recentDocuments = this.fetchRecentDocuments(5);
        viewModel.randomDocuments = this.fetchRandomDocuments(5);
        viewModel.popularDocuments = this.fetchPopularDocuments(5);

        res.render("home", viewModel);
    }

    /**
     * Fetch the most recent documents
     */
    fetchRecentDocuments(count) {
        let documents = this._documents.all();

        return _.chain(documents)
            .reject({"updateDate": null})
            .sortBy("updateDate")
            .reverse()
            .take(count)
            .value();
    }

    /**
     * Fetch random documents
     */
    fetchRandomDocuments(count) {
        let documents = this._documents.all();

        return _.chain(documents)
            .sortBy((document) => _.random(1, true))
            .take(count)
            .value();
    }

    /**
     * Fetch the most popular documents
     */
    fetchPopularDocuments(count) {
        let documents = this._documents.all();

        return _.chain(documents)
            .sortBy((document) => this._analyticsService.getViewCount(document.slug))
            .reverse()
            .take(count)
            .value();
    }
}

module.exports = HomeController;
