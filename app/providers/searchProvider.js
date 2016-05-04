"use strict";

const _ = require("lodash");
const lunr = require("lunr");
const marked = require("marked");

/**
 * Search Provider that provides searching capabilities
 * for the documents in the system
 */
class SearchProvider {

    constructor(documentRepository, config) {
        this._documents = documentRepository;
        this._config = config;
        this._excerptLength = 300;
        this._searchTerms = {};
        this._index = null;

        // If we need an additional locale support
        if (this._config.lunr_locale) {
            require("lunr-languages/lunr.stemmer.support.js")(lunr);
            require("lunr-languages/lunr." + this._config.lunr_locale + ".js")(lunr);
        }

        this._setup(this._config);
    }

    /**
     * Setup the initial search index.
     */
    _setup(config) {
        this._index = lunr(function() {
            // Activating out locale supports
            if (config.lunr_locale) {
                this.use(lunr[config.lunr_locale]);
            }

            this.field("title", { boost: 10 });
            this.field("markdown");
            this.field("tags", 100);
            this.ref("slug");
        });

        // add documents to the index
        _.forEach(this._documents.all(), (document) => this._index.add(document));
    }

    /**
     * Updates term search count and does document search for the provided
     * search term.
     * @param term [string] - term to search for within documents
     */
    search(term) {
        this.updateTermCount(term);
        return this.internalSearch(term);
    }

    /**
     * Will do a document search with the given search term
     * @param term [string] - term to search for within documents
     */
    internalSearch(term) {
        let results = this._index.search(term);

        // map the results to the documents and create excerpts
        return _.chain(results)
            .map((result) => _.find(this._documents.all(), { "slug": result.ref }))
            .filter((document) => document != null)
            .forEach((document) => {
                let excerpt = document.markdown.substring(0, this._excerptLength) + " ...";
                document.html = marked(excerpt);
            })
            .value();
    }

    /**
     * Add a document to the index
     */
    indexAdd(document) {
        this._index.add(document);
    }

    /**
     * Update a document in the index
     */
    indexUpdate(document) {
        this._index.update(document);
    }

    /**
     * Remove a document in the index
     */
    indexRemove(document) {
        this._index.remove(document);
    }

    /**
     * Updates the term count for the given search term
     */
    updateTermCount(term) {
        if (!term) return;

        if (this._searchTerms[term]) {
            this._searchTerms[term]++;
        } else {
            this._searchTerms[term] = 1;
        }
    }

    /**
     * Handles getting the most popular search terms
     */
    getPopularSearchTerms(count) {
        var keys = _.sortBy(_.keys(this._searchTerms), (key) => this._searchTerms[key]);

        return _.chain(keys).reverse().take(count).value();
    }
}

module.exports = SearchProvider;