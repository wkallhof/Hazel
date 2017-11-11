"use strict";

const marked = require("marked");
const Document = require("../models/document");
const DetailViewModel = require("../models/detailViewModel");
const EditViewModel = require("../models/editViewModel");
const _ = require("lodash");

class DocumentController {
    constructor(server, config, authMethod, documentRepository, analyticsService, storageProvider, searchProvider, parserUtility) {
        this._server = server;
        this._config = config;
        this._auth = authMethod;
        this._documents = documentRepository;
        this._analyticsService = analyticsService;
        this._storageProvider = storageProvider;
        this._searchProvider = searchProvider;
        this._parserUtility = parserUtility;

        this._bindRoutes();
    }

    _bindRoutes() {
         // /[slug]/edit
        this._server.get("/:slug/edit", this._auth, this.edit.bind(this));
        // /[slug]/delete
        this._server.get("/:slug/delete", this._auth, this.delete.bind(this));
        // /[slug]/save
        this._server.post("/:slug/save", this._auth, this.save.bind(this));
        // /new
        this._server.get("/new", this._auth, this.new.bind(this));
        // /[slug]
        this._server.get("/:slug", this._auth, this.detail.bind(this));
        // /upload
        this._server.post("/upload", this._auth, this.upload.bind(this));
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
        viewModel.relatedDocuments = this._fetchRelatedDocuments(viewModel.title, 5);
        viewModel.recentDocuments = this._fetchRecentDocuments(5);
        viewModel.config = this._config;
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

        let viewModel = new EditViewModel();
        viewModel.title = document.title;
        viewModel.document = document;
        viewModel.config = this._config;

        res.render("edit", viewModel);
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
        if (originalSlug && originalSlug.length > 0 && originalSlug !== slug) {
            console.log("removing old document: " + originalSlug);
            this._documents.delete(originalSlug);
            this._searchProvider.indexRemove({ slug: originalSlug});
        }

        res.redirect(this._config.base + slug);
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

        res.redirect(this._config.base);
    }

     /**
     * GET : Handle new request
     */
    new(req, res, next) {
        console.log("creating new document");

        let document = new Document();
        document.slug = "";
        document.title = "New document";

        let viewModel = new EditViewModel();
        viewModel.document = document;
        viewModel.title = document.title;
        viewModel.config = this._config;

        res.render("edit", viewModel);
    }

    /**
     * POST : Image uploading handler
     */
    upload(req, res, next) {
        this._storageProvider.storeFile(req, res, function(err) {
            if(err) {
                return res.status(422).send(err);
            }
            return res.status( 200 ).send( req.file.filename );
        });
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
     * Fetch the related documents
     */
    _fetchRelatedDocuments(title, count) {
        return _.chain(this._searchProvider.internalSearch(title))
            .reject({ "title": title })
            .take(count)
            .value();
    }
}

module.exports = DocumentController;
