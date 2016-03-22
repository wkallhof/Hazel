"use strict";

const _ = require("lodash");

/**
 * Document Repository used to manage and read from
 * the collection of documents. Creates a shallow clone
 * of all documents before sending for consumption in order
 * to enforce using the repo for CRUD operations.
 */
class DocumentRepository {

    constructor(documentStorageProvider) {
        this._storageProvider = documentStorageProvider;
        this._documents = this._storageProvider.getAllDocuments();
    }

    /**
     * Return all documents in the repository
     */
    all() {
        return _.chain(this._documents)
            .map((document) => _.clone(document))
            .compact()
            .value();
    }

    /**
     * Return a single document that matches the
     * provided slug
     */
    get(slug) {
        var document = _.find(this._documents, { "slug": slug });
        return _.clone(document);
    }

    /**
     * Add a document to the repository
     */
    add(document) {
        var existing = _.find(this._documents, { "slug": document.slug });
        if (!existing) {
            document.createDate = Date.now();
            document.updateDate = document.createDate;
            document.tags = document.tags || [];
            this._storageProvider.storeDocument(document);
            this._documents.push(document);
        }
    }

    /**
     * Update an existing document in the repository
     */
    update(document) {
        var index = _.findIndex(this._documents, { "slug": document.slug });
        if (index >= 0) {
            this._documents[index] = document;
            this._documents[index].updateDate = Date.now();
            this._documents[index].tags = document.tags || [];
            this._storageProvider.storeDocument(this._documents[index]);
        } else {
            this.add(document);
        }
    }

    /**
     * Delete a document from the repository
     */
    delete(slug) {
        var existingDoc = _.find(this._documents, { "slug": slug });
        if (existingDoc) {
            this._storageProvider.deleteDocument(existingDoc);
            _.remove(this._documents, { "slug": slug });
        }
    }
}

module.exports = DocumentRepository;