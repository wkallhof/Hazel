import { Get, Controller, Inject, Res, Param, HttpException } from '@nestjs/common';
import { IDocumentService } from '../document/document.service';
import Document from '../document/document';
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import { HomeViewModel } from './home.viewModel';
import * as _ from "lodash";
import { HazelConfig } from '../../hazel.config';
import { IAnalyticsService } from '../analytics/analytics.service';

@Controller()
export class HomeController extends BaseController {

    private readonly _documentService: IDocumentService;
    private readonly _config: HazelConfig;
    private readonly _analyticsService: IAnalyticsService;

    constructor(@Inject(DI.IDocumentService) documentService: IDocumentService,
                @Inject(DI.HazelConfig) config: HazelConfig,
                @Inject(DI.IAnalyticsService) analyticsService: IAnalyticsService)
    {
        super();
        this._documentService = documentService;
        this._config = config;
        this._analyticsService = analyticsService;
    }
    
    /**
     * GET : /
     * 
     * Main Home landing page route
     */
	@Get()
    async index(@Res() res, @Param() params) {
        
        // load all documents
        var allDocumentsResult = await this._documentService.allAsync();
        if (!allDocumentsResult.success)
            return this.Error("There was a problem loading documents: " + allDocumentsResult.message);
        
        // build home model
        var model = new HomeViewModel();
        model.recentDocuments = this.getRecentDocuments(allDocumentsResult.data, 5);
        model.randomDocuments = this.getRandomDocuments(allDocumentsResult.data, 5);
        model.popularDocuments = await this.getPopularDocuments(allDocumentsResult.data, 5);
        model.title = this._config.appTitle;

        return this.View(res, "home", model);
    }

    /**
     * This gets the most recent documents from the given document
     * collection;
     * 
     * @param documents : Documents to filter
     * @param count : Documents to return
     */
    private getRecentDocuments(documents : Array<Document>, count: number) : Array<Document> {
        return _.chain(documents)
            .reject({"updateDate": null})
            .sortBy("updateDate")
            .reverse()
            .take(count)
            .value();
    }

    /**
     * This gets a random selection of documents from the given document
     * collection;
     * 
     * @param documents : Documents to filter
     * @param count : Documents to return
     */
    private getRandomDocuments(documents : Array<Document>, count: number) : Array<Document> {
        return _.chain(documents)
            .sortBy((document) => _.random(1, true))
            .take(count)
            .value();
    }

    /**
     * Gets the most popular documents by view count
     * 
     * @param documents : Documents to filter
     * @param count : Documents to return
     */
    private async getPopularDocuments(documents: Array<Document>, count: number): Promise<Array<Document>> {
        
        // calculate the view counts for all documents
        const viewCounts =
            await Promise.all(_.map(documents, async (d) => await this.getDocumentViewCount(d.slug)));

        // sort by view count
        return _.chain(documents)
            .sortBy((d: Document) => _.find(viewCounts, (v) => v[0] == d.slug)[1])
            .reverse()
            .take(count)
            .value();
    }

    /**
     * Given a document slug, find the view count for that document from the
     * analytics service
     * 
     * @param slug document slug to look up view count for
     */
    private async getDocumentViewCount(slug: string): Promise<[string,number]>{
        var result = await this._analyticsService.getViewCountAsync(slug);
        if (!result.success) {
            //TODO: Log this
            return [slug, 0];
        }

        return [slug,result.data];
    }
}
