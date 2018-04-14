import { Get, Controller, Inject, Res, Param, HttpException } from '@nestjs/common';
import { IDocumentService } from '../document/document.service';
import Document from '../document/document';
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import { HomeViewModel } from './home.viewModel';
import * as _ from "lodash";
import { HazelConfig } from '../../hazel.config';

@Controller()
export class HomeController extends BaseController {

    private readonly _documentService: IDocumentService;
    private readonly _config: HazelConfig;

    constructor(@Inject(DI.IDocumentService) documentService: IDocumentService, @Inject(DI.HazelConfig) config: HazelConfig,) {
        super();
        this._documentService = documentService;
        this._config = config;
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
}
