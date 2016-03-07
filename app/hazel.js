"use strict"

/* --------- MODULES ------------ */
const express = require("express");
const extend = require("extend");
const path = require("path");
const fs = require('fs');
const favicon = require('serve-favicon');
const ejs = require('ejs');
const layouts = require('express-ejs-layouts');
const marked = require("marked");

let defaultConfig = require("./config.default.js");

/* ----------- HAZEL ------------- */
class Hazel {
    
    constructor(config) {
        this._server = null;
        this.config = defaultConfig;
        
        if (config) { extend(this.config, config); }
        
        this.setupServer();
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
    setupServer(){
        this._server = express();

        // Setup Views
        this.config.theme_dir = this.config.theme_dir || path.join(__dirname, '..', 'themes');
        this.config.theme_name = this.config.theme_name || 'default';

        this._server.set('views', path.join(this.config.theme_dir, this.config.theme_name, 'templates'));
        this._server.use(layouts)
        this._server.set('view engine', 'html');
        this._server.enable('view cache');
        this._server.engine('html', ejs.renderFile);

        // Setup Express
        this._server.use(favicon(this.config.public_dir + '/favicon.ico'));
        this._server.use(express.static(this.config.public_dir));
    }
    
    /**
     * Defines all routes for Hazel
     */
    defineRoutes() {
        // /
        this._server.get("/", this.onHomeRequest.bind(this));
        // /[page]/edit
        this._server.get("/:slug/edit", this.onEditRequest.bind(this));
        // /[page]
        this._server.get("/:slug", this.onDefaultRequest.bind(this));
        // /[anything else]
        this._server.get("*", (req, res, next) => next());
    }
    
    /**
     * Render the homepage
     */
    onHomeRequest(req, res, next) {
        res.render("home");
    }
    
    /**
     * Default Request Handler
     */
    onDefaultRequest(req, res, next) {
        if (!req.params.slug) next();
        let content = this.getContentHtmlBySlug(req.params.slug);
        
        res.render("page", { content: content });
    }
    
    /**
     * Handle edit request
     */
    onEditRequest(req, res, next) {
        if (!req.params.slug) next();
        
        console.log("editing: " + req.params.slug);
        let content = this.getContentHtmlBySlug(req.params.slug);
        
        res.render("page", { content: content });
    }
    
    /**
     * Get the contents of content file
     * based on slug for file
     */
    getContentHtmlBySlug(slug) {
        let filePath = path.join(this.config.content_dir, slug + ".md");
        
        // try to read the file on disk
        try {
            let fileContent = fs.readFileSync(filePath, 'utf8');
            let html = marked(fileContent);
            return html;
        }
        catch(e)
        {
            // error finding file, return null
            console.log("Tried to open file: " + slug + " as markdown. " + e);
            return null;
        }
        
    }
}

module.exports = Hazel;