"use strict";

/**
 * View model representing the Search Page
 */
class SearchViewModel {
    constructor() {
        this.title = "Search";
        this.searchTerm = "";
        this.searchResults = [];
        this.config = {};
    }
}

module.exports = SearchViewModel;