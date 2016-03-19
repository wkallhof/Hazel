"use strict";

/* --------- MODULES ------------ */
const express = require("express");
const extend = require("extend");
const path = require("path");
const favicon = require("serve-favicon");
const ejs = require("ejs");
const layouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const DocumentRepository = require("./repositories/documentRepository");
const Document = require("./models/document");
const marked = require("marked");
const SearchProvider = require("./providers/searchProvider");
const HomeController = require("./controllers/homeController");
const AnalyticsService = require("./services/analyticsService");

let defaultConfig = require("./config.default.js");

/* ----------- HAZEL ------------- */
class Hazel {

    constructor(config, StorageProvider) {
        this._server = null;

        this.config = defaultConfig;

        if (config) { extend(this.config, config); }

        this._storageProvider = new StorageProvider(this.config);
        this._documentRepository = new DocumentRepository(this._storageProvider);
        this._searchProvider = new SearchProvider(this._documentRepository);
        this._analyticsService = new AnalyticsService(this._storageProvider);

        this.setupServer();

        this._homeController = new HomeController(this._server, this._documentRepository, this._searchProvider, this._analyticsService);

        this.defineRoutes();
    }

    /**
     *  Allow direct access to the server
     */
    get server() {
        return this._server;
    }

    /**
     * Setup the server
     */
    setupServer() {
        this._server = express();

        // Setup Views
        this.config.theme_dir = this.config.theme_dir || path.join(__dirname, "..", "themes");
        this.config.theme_name = this.config.theme_name || "default";

        this._server.set("views", path.join(this.config.theme_dir, this.config.theme_name, "templates"));
        this._server.use(layouts);
        this._server.set("layout extractScripts", true);
        this._server.set("layout extractStyles", true);
        this._server.set("view engine", "html");
        this._server.enable("view cache");
        this._server.engine("html", ejs.renderFile);

        // Setup Express
        this._server.use(favicon(this.config.public_dir + "/favicon.ico"));
        this._server.use(express.static(this.config.public_dir));
        this._server.use(bodyParser.urlencoded({ extended: false }));
    }

    /**
     * Defines all routes for Hazel
     */
    defineRoutes() {
        // /[page]/edit
        this._server.get("/:slug/edit", this.onEditRequest.bind(this));
        // /[page]/save
        this._server.post("/:slug/save", this.onSaveEditRequest.bind(this));
        // /[page]
        this._server.get("/:slug", this.onDefaultRequest.bind(this));
        // /[anything else]
        this._server.get("*", (req, res, next) => next());
    }

    /**
     * Default Request Handler
     */
    onDefaultRequest(req, res, next) {
        if (!req.params.slug) next();

        let slug = req.params.slug;
        let document = this._documentRepository.get(slug);

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
    onEditRequest(req, res, next) {
        if (!req.params.slug) next();

        let slug = req.params.slug;
        console.log("editing: " + slug);

        let document = this._documentRepository.get(slug);
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
    onSaveEditRequest(req, res, next) {
        if (!req.params.slug) next();

        let slug = req.params.slug;

        let document = new Document();
        document.title = req.body.title;
        document.markdown = req.body.content;
        document.tags = req.body.tags.split(",");
        document.slug = slug;

        console.log("save: " + document.title);
        this._documentRepository.update(document);

        res.redirect("/" + slug);
    }
}

module.exports = Hazel;