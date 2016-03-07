
/* --------- MODULES ------------ */
const express = require("express");
const extend = require("extend");
const path = require("path");
const fs = require('fs');
const favicon = require('serve-favicon');
const ejs = require('ejs');

let defaultConfig = require("./config.default.js");

/* ----------- HAZEL ------------- */
class Hazel {
    
    constructor(config) {
        this.server = null;
        this.config = defaultConfig;
        
        if (config) { extend(this.config, config); }
        
        this.setupServer();
        this.defineRoutes();
    }
    
    /**
     *  Allow direct access to the server
     */
    get server() {
        return this.server;
    }
    
    /**
     * Setup the server
     */
    setupServer(){
        this.server = express();

        // Setup Views
        this.config.theme_dir = this.config.theme_dir || path.join(__dirname, '..', 'themes');
        this.config.theme_name = this.config.theme_name || 'default';

        this.server.set('views', path.join(this.config.theme_dir, this.config.theme_name, 'templates'));
        this.server.set('layout', 'layout');
        this.server.set('view engine', 'html');
        this.server.enable('view cache');
        this.server.engine('html', ejs.renderFile);

        // Setup Express
        this.server.use(favicon(this.config.public_dir + '/favicon.ico'));
        this.server.use(express.static(this.config.public_dir));
    }
    
    /**
     * Defines all routes for Hazel
     */
    defineRoutes() {
        /* /[anything] */
        this.server.get('*', this.onDefaultRequest.bind(this));
    }
    
    /**
     * Default Request Handler
     */
    onDefaultRequest(req, res, next) {
        if (!req.params[0]) next();
        
        var slug = req.params[0];
    }
}

module.exports = Hazel;