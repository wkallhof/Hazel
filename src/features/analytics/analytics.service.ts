import { Component, Inject } from "@nestjs/common";
import { ServiceDataResult, ServiceResult } from "../shared/service-result";
import DI from "../../di";
import { IStorageService } from "../storage/storage.service";

/**
 * Service to manage tracking things like view count on specific
 * documents
 * 
 * @export
 * @interface IAnalyticsService
 */
export interface IAnalyticsService{
    incrementViewCountAsync(slug: string): Promise<ServiceResult>;
    resetViewCountAsync(slug: string): Promise<ServiceResult>;
    getViewCountAsync(slug : string): Promise<ServiceDataResult<number>>;
}

/**
 * Implementation of IAnalyticsService that persists the view data through the
 * storage service as JSON
 */
@Component()
export class JsonStorageAnalyticsService implements IAnalyticsService {

    private readonly _storageService: IStorageService;
    private _pageVisits: any;

    constructor(@Inject(DI.IStorageService) storageService: IStorageService) {
        this._storageService = storageService;
    }

    /**
     * Initializes our analytics data by loading from our storage provider
     */
    public async initializeAsync() : Promise<ServiceResult> {
        // read the visits data
        const readResult = await this._storageService.readObjectAsync("visits.json");
        // validate our results
        if (!readResult.success) {
            //TODO: Log this 
        }

        this._pageVisits = readResult.success ? readResult.data : {};
        return new ServiceResult({ success: true });
    }

    /**
     * Given a document slug, this will increment the view count
     * for that document.
     * 
     * @param slug : Slug of document to increments view count on
     */
    public async incrementViewCountAsync(slug: string): Promise<ServiceResult>{

        // ensure we have a slug
        if (!slug)
            return new ServiceResult({ success: false, message: "No slug provided to analytics service" });    

        // increment or set the visit count
        if (this._pageVisits[slug]) {
            this._pageVisits[slug]++;
        } else {
            this._pageVisits[slug] = 1;
        }

        // store our data to keep it in sync
        var storeResult = await this._storageService.storeObjectAsync("visits.json", this._pageVisits);
        if (!storeResult.success)
            return new ServiceResult({ success: false, message: "Error storing view count: " + storeResult.message });    
        
        // return success
        return new ServiceResult({ success: true });
    }

    /**
     * Given a document slug, this will reset the view count for the document
     * associated with the slug
     * @param slug Slug of document to reset counter on
     */
    public async resetViewCountAsync(slug: string): Promise<ServiceResult>{
        // ensure we have a slug
        if (!slug)
            return new ServiceResult({ success: false, message: "No slug provided to analytics service" });
        
        this._pageVisits[slug] = 0;

        // store our data to keep it in sync
        var storeResult = await this._storageService.storeObjectAsync("visits.json", this._pageVisits);
        if (!storeResult.success)
            return new ServiceResult({ success: false, message: "Error storing view count: " + storeResult.message });    
        
        // return success
        return new ServiceResult({ success: true });
    }

    /**
     * Given a document slug, find the view count for that given document.
     * @param slug Slug of document to get view count for
     */
    public async getViewCountAsync(slug: string): Promise<ServiceDataResult<number>>{
        // ensure we have a slug
        if (!slug)
            return new ServiceDataResult<number>({ success: false, message: "No slug provided to analytics service" });    
        
        // load our visit count
        const visitCount = (!slug || !this._pageVisits[slug]) ? 0 : this._pageVisits[slug];

        // return data
        return new ServiceDataResult<number>({ success: true, data: visitCount });
    }
}