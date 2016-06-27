"use strict";

/* --------- MODULES ------------ */
const express               = require("express");
const extend                = require("extend");
const path                  = require("path");
const favicon               = require("serve-favicon");
const ejs                   = require("ejs");
const layouts               = require("express-ejs-layouts");
const bodyParser            = require("body-parser");
const DocumentRepository    = require("./repositories/documentRepository");
const SearchProvider        = require("./providers/searchProvider");
const HomeController        = require("./controllers/homeController");
const DocumentController    = require("./controllers/documentController");
const AnalyticsService      = require("./services/analyticsService");
const TagController         = require("./controllers/tagController");
const SearchController      = require("./controllers/searchController");
const NotFoundController    = require("./controllers/notFoundController");
const DocumentParserUtility = require("./utilities/documentParserUtility");
const SyncController        = require("./controllers/syncController");
const AuthProvider          = require("./providers/authenticationProvider");

let defaultConfig = require("./config.default.js");

/* ----------- HAZEL ------------- */
class Hazel {

    constructor(config, StorageProvider) {
        this._server = null;

        this._config = defaultConfig;
        if (config) { extend(this._config, config); }

        /* Services, Providers, Utilities, Repositories */
        this._authProvider          = new AuthProvider(this._config);
        this._documentParserUtility = new DocumentParserUtility();
        this._storageProvider       = new StorageProvider(this._config, this._documentParserUtility);
        this._documentRepository    = new DocumentRepository(this._storageProvider);
        this._searchProvider        = new SearchProvider(this._documentRepository, this._config);
        this._analyticsService      = new AnalyticsService(this._storageProvider);

        this.setupServer();

        // define our authentication method with proper binding
        let authMethod = this._authProvider.authenticate.bind(this._authProvider);

        /* Controllers */
        this._homeController        = new HomeController(this._server, this._config, authMethod, this._documentRepository, this._searchProvider, this._analyticsService);
        this._tagController         = new TagController(this._server, this._config, authMethod, this._documentRepository, this._searchProvider, this._analyticsService);
        this._searchController      = new SearchController(this._server, this._config, authMethod, this._searchProvider);
        this._documentController    = new DocumentController(this._server, this._config, authMethod, this._documentRepository, this._analyticsService, this._storageProvider, this._searchProvider, this._documentParserUtility);
        this._syncController        = new SyncController(this._server, this._config, authMethod, this._documentRepository, this._searchProvider);
        this._notFoundController    = new NotFoundController(this._server, this._config, authMethod, this._storageProvider);
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
        this._config.theme_dir = this._config.theme_dir || path.join(__dirname, "..", "themes");
        this._config.theme_name = this._config.theme_name || "default";

        this._server.set("views", path.join(this._config.theme_dir, this._config.theme_name, "templates"));
        this._server.use(layouts);
        this._server.set("layout extractScripts", true);
        this._server.set("layout extractStyles", true);
        this._server.set("view engine", "html");
        this._server.enable("view cache");
        this._server.engine("html", ejs.renderFile);

        // Setup Express
        this._server.use(favicon(this._config.public_dir + "/favicon.ico"));
        this._server.use(express.static(this._config.public_dir));
        this._server.use('/uploads', express.static(this._config.uploads_dir));
        this._server.use(bodyParser.urlencoded({ extended: false }));
    }
}

module.exports = Hazel;