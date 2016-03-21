"use strict";

const _ = require("lodash");
const request = require("request");

class SyncController {
    constructor(server, config, documentRepository, searchProvider) {
        this._server = server;
        this._config = config;
        this._documents = documentRepository;
        this._searchProvider = searchProvider;

        this.bindRoutes();
    }

    bindRoutes() {
        // /sync
        this._server.get("/sync", this.index.bind(this));

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
        res.render("sync", {title: "Sync Documents", syncKey: this._config.sync_key});
    }

    /**
     * Handle the Sync target Single request
     */
    returnSingle(req, res, next) {
        if (!req.params.key) { next(); return; }
        if (!req.params.slug) { next(); return; }

        if (!this.validateKey(res, req.params.key)) return;

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

        if (!this.validateKey(res, req.params.key)) return;

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

        if (!this.validateKey(res, req.params.key)) return;

        let endpoint = req.params.server + "/sync-target/" + req.params.key + "/" + req.params.slug;

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

        if (!this.validateKey(res, req.params.key)) return;

        let endpoint = req.params.server + "/sync-target/" + req.params.key;

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

        if (!this.validateKey(res, req.params.key)) return;
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
    validateKey(res, key) {
        if (key === this._config.sync_key) return true;

        res.json({ message: "Invalid Sync Key" });
        return false;
    }
}

module.exports = SyncController;
