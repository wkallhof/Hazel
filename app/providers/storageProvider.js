"use strict";

const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const _s = require("underscore.string");
const multer = require("multer");

/**
 * Handles all storage related tasks. This
 * allows us to swap out providers in order to handle different
 * scenarios like cloud storage or version control storage as
 * apposed to just disk based storage.
 */
class StorageProvider {

    constructor(config, parserUtility) {
        this._config = config;
        this._parser = parserUtility;

        this._createDirectories();
        this._setupFileStorage();
    }

        /**
     * Handles creating directories
     * for storing data and content
     */
    _createDirectories() {
        try {
            fs.mkdirSync(this._config.content_dir);
            fs.mkdirSync(this._config.data_dir);
            fs.mkdirSync(this._config.uploads_dir);
        } catch (e) { /* Do nothing */ }
    }

    /**
     * Handles setting up the file storage using
     * multer
     */
    _setupFileStorage() {
        let storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, this._config.uploads_dir);
            }.bind(this),
            filename: function (req, file, cb) {
                let filename = file.originalname.substr(0, file.originalname.lastIndexOf('.')) + '-' + Date.now() + file.originalname.substr(file.originalname.lastIndexOf('.'));
                cb(null, filename);
            }
        });
         
        this._uploadImageHandler = multer({ storage: storage }).single("file");
    }

    /**
     * Handles reading in a document.
     */
    readDocument(slug) {
        if (!slug) return null;

        let filePath = path.join(this._config.content_dir, slug + ".md");

        // try to read the file on disk
        try {
            let fileContent = fs.readFileSync(filePath, "utf8");
            let document = this._parser.getDocumentFromFileContent(fileContent);
            if (!document) return null;

            document.slug = slug;
            if (!document.title) {
                document.title = this.slugToTitle(slug);
            }

            return document;
        } catch (e) {
            // error finding file, return null
            console.log("Tried to open file: " + slug + " as markdown. ");
            return null;
        }
    }

    /**
     * Handles storing a document.
     */
    storeDocument(document) {
        let filePath = path.join(this._config.content_dir, document.slug + ".md");
        let fileContent = this._parser.convertDocumentToFileContent(document);

        try {
            fs.writeFileSync(filePath, fileContent, "utf8");
        } catch (e) {
            console.log("Error writing content to file" + document.slug);
        }
    }

    /**
     * Handles deleting a document.
     */
    deleteDocument(document) {
        let filePath = path.join(this._config.content_dir, document.slug + ".md");

        try {
            fs.unlinkSync(filePath);
        } catch (e) {
            console.log("Error deleting file" + document.slug);
        }
    }

    /**
     * Handles getting all documents.
     */
    getAllDocuments() {
        try {
            let fileNames = fs.readdirSync(this._config.content_dir);
            let validFiles = _.filter(fileNames, (fileName) => {
                return fileName.length > 3 && fileName.endsWith(".md");
            });

            let documents = _.map(validFiles, (fileName) => {
                return this.readDocument(fileName.replace(".md", ""));
            });

            return documents;
        } catch (e) {
            console.log("Error reading all files");
        }
    }

    /**
     * Handles storing a object to a file on disk.
     */
    storeObject(fileName, object) {
        let filePath = path.join(this._config.data_dir, fileName);

        try {
            fs.writeFile(filePath, JSON.stringify(object), "utf8");
        } catch (e) {
            console.log("Error writing object to file" + fileName);
        }
    }

    /**
     * Handles reading a file on disk and converting to
     * an object.
     */
    readObject(fileName) {
        let filePath = path.join(this._config.data_dir, fileName);

        // try to read the file on disk
        try {
            let fileContent = fs.readFileSync(filePath, "utf8");
            return JSON.parse(fileContent);
        } catch (e) {
            // error finding file, return null
            console.log("Tried to open file: " + fileName + " as object. ");
            return null;
        }
    }

    /**
     * Handles reading a file on disk and converting to
     * an object.
     */    
    storeFile(req, res, callback) {
        return this._uploadImageHandler(req, res, callback);
    }

    /**
     * Handles converting the provided slug string
     * to a title with spaces and capitalization
     */
    slugToTitle(slug) {
        return _s.titleize(_s.humanize(slug.trim()));
    }

    /**
     * Handles converting a title to a slug
     * for the URL
     */
    titleToSlug(title) {
        return title.toString().toLowerCase()
            .replace(/\s+/g, "-")           // Replace spaces with -
            .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
            .replace(/\-\-+/g, "-")         // Replace multiple - with single -
            .replace(/^-+/, "")             // Trim - from start of text
            .replace(/-+$/, "");            // Trim - from end of text
    }
}

module.exports = StorageProvider;