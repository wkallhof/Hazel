import { Get, Controller, Inject, Res, Param, HttpException } from '@nestjs/common';
import { Response } from "express";
import Document from '../document/document';
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import { IAnalyticsService } from '../analytics/analytics.service';
import { HazelConfig } from '../../hazel.config';
import SearchViewModel from './search.viewModel';
import { ISearchService } from './search.service';

@Controller()
export class SearchController extends BaseController {

    private readonly _searchService: ISearchService;
    private readonly _config: HazelConfig;
    private readonly _analyticsService: IAnalyticsService;

    constructor(@Inject(DI.ISearchService) searchService: ISearchService,
                @Inject(DI.HazelConfig) config: HazelConfig,
                @Inject(DI.IAnalyticsService) analyticsService: IAnalyticsService)
    {
        super();

        this._config = config;
        this._analyticsService = analyticsService;
        this._searchService = searchService;
    }
    
	@Get("/search/:term")
    async index(@Res() res: Response, @Param() params) {
        
        if (params.term == null)
            this.BadRequest();
        
        var searchResponse = await this._searchService.searchAsync(params.term);
        if (!searchResponse.success)
            return Error(searchResponse.message);    
        
        var model = new SearchViewModel();
        model.title = "Search";
        model.term = params.term;
        model.results = searchResponse.data;

        return this.View(res, "search", model);
    }
}
