"use strict";

/**
 * View model representing the Site Sections for listing
 * on the home page
 */
class SiteSectionViewModel {
    constructor() {
        this.description = "";
        this.title = "";
        this.tag = "";
        this.documentCount = 0;
    }
}

module.exports = SiteSectionViewModel;