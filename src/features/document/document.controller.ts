import { Get, Post, Controller, Body, HttpStatus, Param, HttpException, ValidationPipe, UsePipes, Res, Inject } from '@nestjs/common';
import { IDocumentService } from './document.service';
import { Response } from "express";
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import Document from "./document";
import { IAnalyticsService } from '../analytics/analytics.service';


@Controller()  
export class DocumentController extends BaseController {

    private readonly _analyticsService: IAnalyticsService;
    private readonly _documentService: IDocumentService;

    constructor(@Inject(DI.IDocumentService) documentService: IDocumentService,
                @Inject(DI.IAnalyticsService) analyticsService: IAnalyticsService) {
        super();
        this._documentService = documentService;
        this._analyticsService = analyticsService;
    }

    @Get(":slug")
    async details(@Res() res, @Param() params) {
        if (params.slug == null)
            this.NotFound();
        
        const result = await this._documentService.getAsync(params.slug);
        if (!result.success)
            this.NotFound(result.message);
        
        const document = result.data;
        await this._analyticsService.incrementViewCountAsync(document.slug);
        
        return this.View(res, "document", { document: document});
    }

    @Post(":slug")
    async create(@Res() res : Response, @Param() params, @Body() document: Document) {
        if (params.slug == null)
            this.BadRequest();
        
        const result = await this._documentService.addAsync(document);
        if (!result.success)
            this.BadRequest(result.message);
        
        this.Ok(res);
    }
}
