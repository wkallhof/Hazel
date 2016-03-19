"use strict";

const _ = require("lodash");

/**
 * Search Provider that provides searching capabilities
 * for the documents in the system
 */
class SearchProvider {

    constructor(documentRepository) {
        this._documents = documentRepository;
        this._searchTerms = {};
    }

    /**
     * Will do a document search with the given search term
     * @param term [string] - term to search for within documents
     */
    search(term) {
        if (!term) return null;

        if (this._searchTerms[term]) {
            this._searchTerms[term]++;
        } else {
            this._searchTerms[term] = 1;
        }

        // TODO : Actual Search
    }

    /**
     * Handles getting the most popular search terms
     */
    getPopularSearchTerms(count) {
        var keys = _.sortBy(_.keys(this._searchTerms), function (key) {
            return this._searchTerms[key];
        });

        return _.take(keys, count);
    }
}

module.exports = SearchProvider;