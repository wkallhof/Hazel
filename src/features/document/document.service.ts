import { Component, Inject } from '@nestjs/common';
import Document from './document';
import { ServiceResult, ServiceDataResult } from '../shared/service-result';
import * as _ from "lodash";
import DI from '../../di';
import { IStorageService } from '../storage/storage.service';

/**
 * Service to manage documents
 * 
 * @export
 * @interface IDocumentService
 */
export interface IDocumentService{
    allAsync(): Promise<ServiceDataResult<Array<Document>>>;
    getAsync(slug : string): Promise<ServiceDataResult<Document>>;
    addAsync(document : Document): Promise<ServiceResult>;
    updateAsync(document: Document): Promise<ServiceResult>;
    existsAsync(slug: string): Promise<ServiceDataResult<boolean>>;
    deleteAsync(slug: string): Promise<ServiceResult>;
}

@Component()
export class DocumentService implements IDocumentService {

    private _documents: Array<Document>;
    private readonly _storageService : IStorageService;

    constructor(@Inject(DI.IStorageService) storageService: IStorageService) {
        this._documents = new Array<Document>();
        this._storageService = storageService;
    }

    /*--------------------------------------------*
     *          SERVICE IMPLEMENTATION            *
     *--------------------------------------------*/
    
    /**
     * Initializes the document service by getting all documents up front
     * for our in-memory storage for performance reasons.
     */
    public async initializeAsync(): Promise<ServiceResult>{
        var result = await this._storageService.getAllDocumentsAsync();
        if (!result.success)
            return new ServiceResult({ success: false, message: "Error initializing document service: " + result.message });
        
        this._documents = result.data;
        return new ServiceResult({ success: true });
    }
    
    /**
     * Gets all documents in the document service
     * 
     * @returns {Promise<ServiceDataResult<Document[]>>} 
     * @memberof DocumentService
     */
    public async allAsync(): Promise<ServiceDataResult<Document[]>> {
        const result = _.chain(this._documents)
            .map((document) => _.clone(document))
            .compact()
            .value();
        
        return new ServiceDataResult({success : true, data : result});
    }

    /**
     * Gets a single document by document slug
     * 
     * @param {string} slug : Document slug
     * @returns {Promise<ServiceDataResult<Document>>} 
     * @memberof DocumentService
     */
    public async getAsync(slug: string): Promise<ServiceDataResult<Document>> {
        const match = _.clone(_.find(this._documents, { "slug": slug }));
        return match == null ?
            new ServiceDataResult<Document>({ success: false, message: "Document not found" }) :
            new ServiceDataResult<Document>({ success: true, data: match });
    }

    /**
     * Adds a new document
     * 
     * @param {Document} document : Document to add
     * @returns {Promise<ServiceResult>} 
     * @memberof DocumentService
     */
    public async addAsync(document: Document): Promise<ServiceResult> {
        if (document == null)
            return new ServiceResult({ success: false, message: "Null document while adding" });
        
        var match = _.find(this._documents, { "slug": document.slug });
        if (match != null)
            return new ServiceResult({ success: false, message: "Document already exists" });
        
        document.createDate = Date.now();
        document.updateDate = document.createDate;
        document.tags = document.tags || [];

        const result = await this._storageService.storeDocumentAsync(document);
        if (!result.success)
            return new ServiceResult(result);    

        this._documents.push(document);

        return new ServiceResult({ success: true });
    }

    /**
     * Update an existing document
     * 
     * @param {Document} document : Document to update
     * @returns {Promise<ServiceResult>} 
     * @memberof DocumentService
     */
    public async updateAsync(document : Document): Promise<ServiceResult> {
        if (document == null)
            return new ServiceResult({ success: false, message: "Null document while updating" });
        
        // update date
        document.updateDate = Date.now();

        // ensure we have an existing doc by finding the index
        var index = _.findIndex(this._documents, { slug: document.slug });
        if (index < 0)
            return new ServiceResult({ success: false, message: "Document doesn't exists" });    

        // persist the document
        const result = await this._storageService.storeDocumentAsync(document);
        if (!result.success)
            return new ServiceResult(result);
        
        // slip the new document into to the array over the old one
        this._documents.splice(index, 1, document);

        return new ServiceResult({ success: true });
    }

    /**
     * Delete a document by slug
     * 
     * @param {string} slug : Slug of document to delete
     * @returns {Promise<ServiceResult>} 
     * @memberof DocumentService
     */
    public async deleteAsync(slug: string): Promise<ServiceResult> {
        var match = _.find(this._documents, { "slug": slug });
        if (match == null)
            return new ServiceResult({ success: false, message: "Document doesn't exists" });

        let result = await this._storageService.deleteDocumentAsync(match);
        if (!result.success)
            return new ServiceResult(result);
        
        _.remove(this._documents, { "slug": slug });

        return new ServiceResult({ success: true });
    }

    /**
     * Checks if a document exists
     * 
     * @param slug Document slug
     * @returns {Promise<ServiceDataResult<boolean>>} 
     */
    public async existsAsync(slug: string): Promise<ServiceDataResult<boolean>> {
        if (!slug)
            return new ServiceDataResult<boolean>({ success: false, message: "No slug provided" });
        
        var index = _.findIndex(this._documents, { slug: slug });
        return new ServiceDataResult<boolean>({
            success: true,
            data : index > 0 
        });
    }
}