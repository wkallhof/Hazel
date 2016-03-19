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
        // /[slug]/delete
        this._server.get("/:slug/delete", this.delete.bind(this));
        // /[slug]/save
        this._server.post("/:slug/save", this.save.bind(this));
        // /new
        this._server.get("/new", this.new.bind(this));
        // /[slug]
        this._server.get("/:slug", this.detail.bind(this));
    }

    /**
     * GET : Default Request Handler
     */
    detail(req, res, next) {
        if (!req.params.slug) { next(); return; }

        let slug = req.params.slug;
        let document = this._documents.get(slug);

        // check if no content
        if (!document || document.markdown <= 0) { next(); return; }

        this._analyticsService.updateViewCount(slug);
        document.html = marked(document.markdown);
        // render content
        res.render("document", document);
    }

    /**
     * GET : Handle edit request
     */
    edit(req, res, next) {
        if (!req.params.slug) { next(); return; }

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
     * POST : Handle edit request
     */
    save(req, res, next) {
        if (!req.params.slug) { next(); return; }

        let slug = req.params.slug;
        let originalSlug = req.body.originalSlug;

        // create document from form
        let document = new Document();
        document.title = req.body.title;
        document.markdown = req.body.content;
        document.tags = req.body.tags.split(",");
        document.slug = slug;

        // save document
        console.log("save: " + document.title);
        this._documents.update(document);
        this._searchProvider.indexUpdate(document);

        // remove old document if one existed
        if (originalSlug && originalSlug.length > 0 & originalSlug !== slug) {
            console.log("removing old document: " + originalSlug);
            this._documents.delete(originalSlug);
            this._searchProvider.indexRemove({ slug: originalSlug});
        }

        res.redirect("/" + slug);
    }

    /**
     * GET : Handle delete request
     */
    delete(req, res, next) {
        if (!req.params.slug) { next(); return; }

        let slug = req.params.slug;
        console.log("deleting: " + slug);

        let document = this._documents.get(slug);

        if (document) {
            this._documents.delete(slug);
            this._searchProvider.indexRemove({ slug: slug});
        } else { next(); return; }

        res.redirect("/");
    }

     /**
     * GET : Handle new request
     */
    new(req, res, next) {
        console.log("creating new document");

        let document = new Document();
        document.slug = "";
        document.title = "New document";

        res.render("edit", document);
    }
}

module.exports = DocumentController;
