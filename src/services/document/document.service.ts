import { Component, Inject } from '@nestjs/common';
import Document from './document';
import { ServiceResult, ServiceDataResult } from '../service-result';
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
    updateAsync(document : Document): Promise<ServiceResult>;
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
        
        var match = _.find(this._documents, { "slug": document.slug });
        if (match == null)
            return new ServiceResult({ success: false, message: "Document doesn't exists" });
        
        match = document;
        match.updateDate = Date.now();
        match.tags = document.tags || [];
        const result = await this._storageService.storeDocumentAsync(match);
        if (!result.success)
            return new ServiceResult(result);    

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
}