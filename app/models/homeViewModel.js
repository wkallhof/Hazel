"use strict";

/**
 * View model representing the Home Page
 */
class HomeViewModel {
    constructor() {
        this.title = "Home";
        this.popularSearches = [];
        this.recentDocuments = [];
        this.randomDocuments = [];
        this.popularDocuments = [];
    }
}

module.exports = HomeViewModel;