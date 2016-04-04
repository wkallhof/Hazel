"use strict";

const _ = require("lodash");
const request = require("request");
const base64 = require("base-64");
const SyncViewModel = require("../models/syncViewModel");

class SyncController {
    constructor(server, config, authMethod, documentRepository, searchProvider) {
        this._server = server;
        this._auth = authMethod;
        this._config = config;
        this._documents = documentRepository;
        this._searchProvider = searchProvider;

        this._bindRoutes();
    }

    _bindRoutes() {
        // /sync
        this._server.get("/sync", this._auth, this.index.bind(this));

        // /sync-target/[Key]/[Doc Slug]
        this._server.get("/sync-target/:key/:slug", this.returnSingle.bind(this));
        // /sync-target/[Key]
        this._server.get("/sync-target/:key", this.returnList.bind(this));

        // /sync-write/[Key]/[Doc Slug]
        this._server.post("/sync-write/:key", this.write.bind(this));

        // /sync-request/[Key]/[Server Target]
        this._server.get("/sync-request/:key/:server", this.requestList.bind(this));
        // /sync-request/[Key]/[Doc Slug]
        this._server.get("/sync-request/:key/:server/:slug", this.requestSingle.bind(this));
    }

    /**
     * Render the Sync page
     */
    index(req, res, next) {
        let viewModel = new SyncViewModel();
        viewModel.title = "Sync Documents";
        viewModel.syncKey = this._config.sync_key;
        viewModel.config = this._config;

        res.render("sync", viewModel);
    }

    /**
     * Handle the Sync target Single request
     */
    returnSingle(req, res, next) {
        if (!req.params.key) { next(); return; }
        if (!req.params.slug) { next(); return; }

        if (!this._validateKey(res, req.params.key)) return;

        let doc = _.find(this._documents.all(), { "slug": req.params.slug });

        res.json({
            success: doc != null,
            result: doc
        });
    }

    /**
     * Handle the Sync target List request
     */
    returnList(req, res, next) {
        if (!req.params.key) { next(); return; }

        if (!this._validateKey(res, req.params.key)) return;

        let documentSlugs = _.map(this._documents.all(), (doc) => doc.slug);

        res.json({
            success: true,
            results: documentSlugs
        });
    }

    /**
     * Handle the Sync Single request
     */
    requestSingle(req, res, next) {
        if (!req.params.key) { next(); return; }
        if (!req.params.server) { next(); return; }
        if (!req.params.slug) { next(); return; }

        if (!this._validateKey(res, req.params.key)) return;

        // decode base64 encoded server
        let server = base64.decode(req.params.server);
        server = server.replace(/\/$/, "");

        let endpoint = server + "/sync-target/" + req.params.key + "/" + req.params.slug;

        request(endpoint, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                let result = JSON.parse(body);
                res.json({ success: result.success, result: result.result});
            } else {
                res.json({ success: false, message: "Error fetching data. "});
            }
        });
    }

    /**
     * Handle the Sync List request
     */
    requestList(req, res, next) {
        if (!req.params.key) { next(); return; }
        if (!req.params.server) { next(); return; }

        if (!this._validateKey(res, req.params.key)) return;

        // decode base64 encoded server
        let server = base64.decode(req.params.server);
        server = server.replace(/\/$/, "");

        let endpoint = server + "/sync-target/" + req.params.key;

        request(endpoint, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                let result = JSON.parse(body);
                res.json({ success: result.success, results: result.results});
            } else {
                res.json({ success: false, message: "Error fetching data. "});
            }
        });
    }

    /**
     * Handle the Sync Write request
     */
    write(req, res, next) {
        if (!req.params.key) { next(); return; }

        if (!this._validateKey(res, req.params.key)) return;
        if (!req.body) { res.json({ message: "Invalid document provided" }); return; }

        let newDoc = req.body;
        let matchingDocument = _.find(this._documents.all(), { "slug": newDoc.slug });

        // handle new document
        if (!matchingDocument) {
            this._documents.add(newDoc);
            this._searchProvider.indexAdd(newDoc);

            res.json({ message: "Added new document: " + newDoc.title });
            return;

        // handle existing and newer document
        } else if (newDoc.updateDate > matchingDocument.updateDate) {
            this._documents.update(newDoc);
            this._searchProvider.indexUpdate(newDoc);

            res.json({ message: "Found newer document, updating: " + newDoc.title });
            return;

        // handle local copy is newer
        } else {
            res.json({ message: "Local document is newer, ignoring: " + newDoc.title });
            return;
        }
    }

    /**
     * Validates the provided key
     */
    _validateKey(res, key) {
        if (key === this._config.sync_key) return true;

        res.json({ message: "Invalid Sync Key" });
        return false;
    }
}

module.exports = SyncController;
