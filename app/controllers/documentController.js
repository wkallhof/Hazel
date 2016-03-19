"use strict";

const marked = require("marked");
const Document = require("../models/document");

class DocumentController {
    constructor(server, documentRepository, analyticsService, storageProvider, searchProvider) {
        this._server = server;
        this._documents = documentRepository;
        this._analyticsService = analyticsService;
        this._storageProvider = storageProvider;
        this._searchProvider = searchProvider;

        this.bindRoutes();
    }

    bindRoutes() {
         // /[slug]/edit
        this._server.get("/:slug/edit", this.edit.bind(this));
        // /[slug]/save
        this._server.post("/:slug/save", this.save.bind(this));
        // /[slug]
        this._server.get("/:slug", this.detail.bind(this));
    }

    /**
     * Default Request Handler
     */
    detail(req, res, next) {
        if (!req.params.slug) next();

        let slug = req.params.slug;
        let document = this._documents.get(slug);

        // check if no content
        if (!document || document.markdown <= 0) {
            res.render("404", { title: this._storageProvider.slugToTitle(slug) });
            return;
        }

        this._analyticsService.updateViewCount(slug);
        document.html = marked(document.markdown);
        // render content
        res.render("document", document);
    }

    /**
     * Handle edit request
     */
    edit(req, res, next) {
        if (!req.params.slug) next();

        let slug = req.params.slug;
        console.log("editing: " + slug);

        let document = this._documents.get(slug);
        if (!document) {
            document = new Document();
            document.slug = slug;
            document.title = this._storageProvider.slugToTitle(slug);
        }

        res.render("edit", document);
    }

    /**
     * Handle edit request
     */
    save(req, res, next) {
        if (!req.params.slug) next();

        let slug = req.params.slug;

        let document = new Document();
        document.title = req.body.title;
        document.markdown = req.body.content;
        document.tags = req.body.tags.split(",");
        document.slug = slug;

        console.log("save: " + document.title);
        this._documents.update(document);
        this._searchProvider.indexUpdate(document);

        res.redirect("/" + slug);
    }
}

module.exports = DocumentController;
