"use strict";

/**
 * Service responsible for tracking page visit counts
 */
class AnalyticsService {

    constructor(storageProvider) {
        this._storageProvider = storageProvider;
        this._pageVisits = this._storageProvider.readObject("visits.json") || {};
    }

    /**
     * Updates the view count for a given document
     * slug
     */
    updateViewCount(slug) {
        if (!slug) return null;

        if (this._pageVisits[slug]) {
            this._pageVisits[slug]++;
        } else {
            this._pageVisits[slug] = 1;
        }

        this._storageProvider.storeObject("visits.json", this._pageVisits);
    }

    /**
     * Getes the view count for a given document
     * slug
     */
    getViewCount(slug) {
        if (!slug || !this._pageVisits[slug]) return 0;
        return this._pageVisits[slug];
    }
}

module.exports = AnalyticsService;