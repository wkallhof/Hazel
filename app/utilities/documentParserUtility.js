"use strict"

const Document = require("../models/document");

/**
 * Utility class that handles parsing the document file
 * for any metadata
 */
class DocumentParserUtility{

    constructor() {
        this._metaRegex = /<!--META (.*) -->/;
    }

    /**
     * Handles taking in file content and returning
     * a document object;
     */
    getDocumentFromFileContent(fileContent)
    {
        let metaData = this.extractMetaData(fileContent);
        let markdown = this.extractContent(fileContent);

        let document = new Document();

        if (metaData) {
            document.title = metaData.title;
            document.tags = metaData.tags;
            document.createDate = metaData.createDate;
            document.updateDate = metaData.updateDate;
        }

        if (markdown) {
            document.markdown = markdown;
        }        

        return document;
    }

    /**
     * Extracts the metadata object from the document
     * file if it exists.
     */
    extractMetaData(fileContent)
    {
        let meta = fileContent.match(this._metaRegex);
        if (!meta || meta.length != 2) return null;

        return JSON.parse(meta[1]);        
    }

    /**
     * Handles extracting just the content from the
     * document file
     */
    extractContent(fileContent)
    {
        return fileContent.replace(this._metaRegex, "");
    }

    /**
     * Handles converting a document into a file content
     * string
     */
    convertDocumentToFileContent(document)
    {
        let metaData = {
            title : document.title,
            tags: document.tags,
            createDate: document.createDate,
            updateDate: document.updateDate
        }

        let metaString = JSON.stringify(metaData);
        let commentString = "<!--META "+metaString+" -->";
        
        return commentString + "\n" + document.markdown;
    }
}

module.exports = DocumentParserUtility;