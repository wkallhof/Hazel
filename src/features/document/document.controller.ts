import { Get, Post, Controller, Body, HttpStatus, Param, HttpException, ValidationPipe, UsePipes, Res, Inject, Delete, Put } from '@nestjs/common';
import { IDocumentService } from './document.service';
import { Response } from "express";
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import Document from "./document";
import { IAnalyticsService } from '../analytics/analytics.service';
import { IDocumentParserService } from './document-parser.service';


@Controller()  
export class DocumentController extends BaseController {

    private readonly _analyticsService: IAnalyticsService;
    private readonly _documentService: IDocumentService;
    private readonly _documentParserService: IDocumentParserService;

    constructor(@Inject(DI.IDocumentService) documentService: IDocumentService,
        @Inject(DI.IAnalyticsService) analyticsService: IAnalyticsService,
        @Inject(DI.IDocumentParserService) documentParserService: IDocumentParserService) {
        
        super();
        this._documentService = documentService;
        this._analyticsService = analyticsService;
        this._documentParserService = documentParserService;
    }

    /**
     * GET: /[slug]
     * 
     * Get's the document for the given slug. If the slug isn't found
     * it redirects to the edit page for that document
     */
    @Get(":slug")
    async details(@Res() res, @Param() params) {
        if (params.slug == null)
            return this.Redirect(res, "/");
        
        const result = await this._documentService.getAsync(params.slug);
        if (!result.success)
            return this.Redirect(res, params.slug+"/edit");
        
        const document = result.data;
        var parsedResult = await this._documentParserService.getHtmlFromContentAsync(document.rawContent);
        if (!parsedResult.success)
            return Error("Error converting document content to HTML : " + parsedResult.message);    
        
        document.html = parsedResult.data;
        await this._analyticsService.incrementViewCountAsync(document.slug);
        
        return this.View(res, "document", { document: document});
    }

    /**
     * Post : /[slug]
     * 
     * Updates an existing document or creates a new document for the give
     * slug
     * 
     * @param document Document posted directly from form
     */
    @Post(":slug")
    async create(@Res() res: Response, @Param() params, @Body() document: Document) {
        // ensure we have a slug
        if (params.slug == null)
            this.BadRequest();
        
        const existsResult = await this._documentService.existsAsync(params.slug);
        if (!existsResult.success)
            return Error(existsResult.message);
        
        const docExists = existsResult.data;

        const result = docExists ?
            await this._documentService.updateAsync(document) :
            await this._documentService.addAsync(document);
        
        if (!result.success)
            this.BadRequest(result.message);
        
        return this.Redirect(res, params.slug);
    }

    /**
     * GET : /[slug]/edit
     * 
     * Displays the edit form for a document
     */
    @Get(":slug/edit")
    async edit(@Res() res : Response, @Param() params) {
        if (params.slug == null)
            this.BadRequest();
        
        const result = await this._documentService.getAsync(params.slug);
        
        var document = result.success ? result.data : new Document({slug: params.slug});
        
        return this.View(res, "edit", { document: document});
    }

    /**
     * POST : /[slug]/delete
     * 
     * Call to delete a document associate with the given slug
     */
    @Post(":slug/delete")
    async delete(@Res() res : Response, @Param() params) {
        if (params.slug == null)
            this.BadRequest();
        
        const result = await this._documentService.deleteAsync(params.slug);
        if (!result.success)
            this.BadRequest(result.message);
        
        return this.Redirect(res, "/");
    }
}
