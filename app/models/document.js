"use strict";

/**
 * Represents a single document in the
 * Hazel system
 */
class Document {
    constructor() {
        this.title = "";
        this.slug = "";
        this.markdown = "";
        this.html = "";
        this.updateDate = null;
        this.createDate = null;
        this.tags = [];
    }
}

module.exports = Document;