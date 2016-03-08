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
const _s = require('underscore.string');
const bodyParser = require('body-parser');

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
        this._server.set("layout extractScripts", true)
        this._server.set("layout extractStyles", true)
        this._server.set('view engine', 'html');
        this._server.enable('view cache');
        this._server.engine('html', ejs.renderFile);

        // Setup Express
        this._server.use(favicon(this.config.public_dir + '/favicon.ico'));
        this._server.use(express.static(this.config.public_dir));
        this._server.use(bodyParser.urlencoded({ extended: false }))
    }
    
    /**
     * Defines all routes for Hazel
     */
    defineRoutes() {
        // /
        this._server.get("/", this.onHomeRequest.bind(this));
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
     * Render the homepage
     */
    onHomeRequest(req, res, next) {
        res.render("home", { title: "Home" });
    }
    
    /**
     * Default Request Handler
     */
    onDefaultRequest(req, res, next) {
        if (!req.params.slug) next();
        let content = this.getContentHtmlBySlug(req.params.slug);
        
        // check if no content
        if (!content || content.length <= 0) {
            res.render("404", { title: this.slugToTitle(req.params.slug) });
            return;
        }
        
        // render content
        res.render("page", { 
            content: content,
            title: this.slugToTitle(req.params.slug),
            slug: req.params.slug
        });
    }
    
    /**
     * Handle edit request
     */
    onEditRequest(req, res, next) {
        if (!req.params.slug) next();
        
        console.log("editing: " + req.params.slug);
        let content = this.getContentMarkdownBySlug(req.params.slug);
        
        res.render("edit", { 
            slug: req.params.slug,
            content: content,
            title: this.slugToTitle(req.params.slug)
        });
    }
    
    /**
     * Handle edit request
     */
    onSaveEditRequest(req, res, next) {
        if (!req.params.slug) next();
        
        let title = req.body.title;
        let content = req.body.content;
        
        console.log("save: " + title);
        
        let slug = this.titleToSlug(title);
        this.writeMarkdownToFile(slug, content);
        
        res.redirect("/" + slug);
    }
    
    /**
     * Get the contents of content file
     * based on slug for file
     */
    getContentHtmlBySlug(slug) {
        var markdown = this.getContentMarkdownBySlug(slug);
        if (markdown)
        {
            return marked(markdown);
        }
        return null;
    }
    
    /**
     * Get the markdown content of content file
     * based on slug for file
     */
    getContentMarkdownBySlug(slug) {
        let filePath = path.join(this.config.content_dir, slug + ".md");
        
        // try to read the file on disk
        try {
            return fs.readFileSync(filePath, 'utf8');
        }
        catch(e)
        {
            // error finding file, return null
            console.log("Tried to open file: " + slug + " as markdown. ");
            return null;
        }
    }
    
    /**
     * Write markdown content to file
     * based on slug name
     */
    writeMarkdownToFile(slug, markdown) {
        let filePath = path.join(this.config.content_dir, slug + ".md");
        
        try {
            fs.writeFileSync(filePath, markdown, 'utf8');
        }
        catch(e){
            console.log("Error writing content to file" + slug);
        }
    }
    
    /**
     * Handles converting the provided slug string
     * to a title with spaces and capitalization
     */
    slugToTitle(slug)
    {
		return _s.titleize(_s.humanize(slug.trim()));
    }
    
    /**
     * Handles converting a title to a slug
     * for the URL
     */
    titleToSlug(title)
    {
        return title.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }
}

module.exports = Hazel;