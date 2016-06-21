"use strict";

const HomeViewModel = require("../models/homeViewModel");
const _ = require("lodash");

class HomeController {
    constructor(server, config, authMethod, documentRepository, searchProvider, analyticsService) {
        this._documents = documentRepository;
        this._auth = authMethod;
        this._server = server;
        this._config = config;
        this._searchProvider = searchProvider;
        this._analyticsService = analyticsService;

        this._bindRoutes();
    }

    _bindRoutes() {
        // /
        this._server.get("/", this._auth, this.index.bind(this));
    }

    /**
     * Render the homepage
     */
    index(req, res, next) {
        var viewModel = new HomeViewModel();

        viewModel.popularSearches = this._searchProvider.getPopularSearchTerms(5);
        viewModel.recentDocuments = this._fetchRecentDocuments(5);
        viewModel.randomDocuments = this._fetchRandomDocuments(5);
        viewModel.popularDocuments = this._fetchPopularDocuments(5);

        this._config.site_sections.forEach(function(section) {
            viewModel.taggedDocuments[section.tag] = this._fetchTaggedDocuments(5, section.tag);
        }, this);

        viewModel.config = this._config;

        res.render("home", viewModel);
    }

    /**
     * Fetch the most recent documents
     */
    _fetchRecentDocuments(count) {
        let documents = this._documents.all();

        return _.chain(documents)
            .reject({"updateDate": null})
            .sortBy("updateDate")
            .reverse()
            .take(count)
            .value();
    }

    /**
     * Fetch the tagged documents
     */
    _fetchTaggedDocuments(count, tag) {
        let documents = this._documents.all();

        return _.chain(documents)
            .filter( function(doc) { return doc.tags.indexOf(tag) != -1; })
            .sortBy("updateDate")
            .reverse()
            .take(count)
            .value();
    }

    /**
     * Fetch random documents
     */
    _fetchRandomDocuments(count) {
        let documents = this._documents.all();

        return _.chain(documents)
            .sortBy((document) => _.random(1, true))
            .take(count)
            .value();
    }

    /**
     * Fetch the most popular documents
     */
    _fetchPopularDocuments(count) {
        let documents = this._documents.all();

        return _.chain(documents)
            .sortBy((document) => this._analyticsService.getViewCount(document.slug))
            .reverse()
            .take(count)
            .value();
    }
}

module.exports = HomeController;
