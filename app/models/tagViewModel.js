"use strict";

/**
 * View model representing the Tag Page
 */
class TagViewModel {
    constructor() {
        this.title = "Tag";
        this.popularSearches = [];
        this.taggedDocuments = [];
        this.config = {};
    }
}

module.exports = TagViewModel;