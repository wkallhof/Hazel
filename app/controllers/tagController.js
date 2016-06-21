"use strict";

const TagViewModel = require("../models/tagViewModel");
const _ = require("lodash");
const marked = require("marked");

class TagController {
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
        this._server.get("/~:tag/", this._auth, this.index.bind(this));
    }

    /**
     * Render the tagpage
     */
    index(req, res, next) {
        if (!req.params.tag) { next(); return; }

        var viewModel = new TagViewModel();

        viewModel.popularSearches = this._searchProvider.getPopularSearchTerms(5);
        viewModel.taggedDocuments = this._fetchTaggedDocuments(100, req.params.tag);
        viewModel.section = _.chain(this._config.site_sections).filter(function(section) { return section.tag == req.params.tag; }).first().value();

        viewModel.config = this._config;

        res.render("tag", viewModel);
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

}

module.exports = TagController;
