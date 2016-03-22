"use strict";

const marked = require("marked");
const Document = require("../models/document");
const DetailViewModel = require("../models/detailViewModel");
const _ = require("lodash");

class DocumentController {
    constructor(server, documentRepository, analyticsService, storageProvider, searchProvider, parserUtility) {
        this._server = server;
        this._documents = documentRepository;
        this._analyticsService = analyticsService;
        this._storageProvider = storageProvider;
        this._searchProvider = searchProvider;
        this._parserUtility = parserUtility;

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

        let viewModel = new DetailViewModel();
        let slug = req.params.slug;
        let document = this._documents.get(slug);

        // check if no content
        if (!document || document.markdown <= 0) { next(); return; }

        this._analyticsService.updateViewCount(slug);
        document.html = marked(document.markdown);

        viewModel.document = document;
        viewModel.title = document.title;
        viewModel.relatedDocuments = this.fetchRelatedDocuments(viewModel.title, 5);
        viewModel.recentDocuments = this.fetchRecentDocuments(5);
        // render content
        res.render("document", viewModel);
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

        // check for links to set
        var missingLinks = this._parserUtility.fetchMissingLinksFromMarkdown(document.markdown);
        if (missingLinks && missingLinks.length > 0) {
            var pairs = _.chunk(missingLinks, 2);

            _.forEach(pairs, (pair) => {
                let slug = this._storageProvider.titleToSlug(pair[1]);
                document.markdown = document.markdown.replace(pair[0], pair[0].replace("()", "(/" + slug + ")"));
            });
        }

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
     * Fetch the related documents
     */
    fetchRelatedDocuments(title, count) {
        return _.chain(this._searchProvider.search(title))
            .reject({ "title": title })
            .take(count)
            .value();
    }
}

module.exports = DocumentController;
