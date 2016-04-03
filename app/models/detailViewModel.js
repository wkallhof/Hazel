"use strict";

/**
 * View model representing the Detail Page
 */
class DetailViewModel {
    constructor() {
        this.document = null;
        this.title = "";
        this.relatedDocuments = [];
        this.recentDocuments = [];
        this.config = {};
    }
}

module.exports = DetailViewModel;