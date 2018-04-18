import { Get, Post, Controller, Body, HttpStatus, Param, HttpException, ValidationPipe, UsePipes, Res, Inject, Delete, Put, Req } from '@nestjs/common';
import { IDocumentService } from './document.service';
import { Response, Request } from "express";
import DI from '../../di';
import { BaseController } from '../shared/base.controller';
import Document from "./document";
import { IAnalyticsService } from '../analytics/analytics.service';
import { IDocumentParserService } from './document-parser.service';
import * as csrf from "csurf";


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
        
        // find the document matching the slug
        const result = await this._documentService.getAsync(params.slug);
        if (!result.success)
            return this.Redirect(res, params.slug+"/edit");
        
        // parse the content into html for rendering
        const document = result.data;
        var parsedResult = await this._documentParserService.getHtmlFromContentAsync(document.rawContent);
        if (!parsedResult.success)
            return Error("Error converting document content to HTML : " + parsedResult.message);    
        document.html = parsedResult.data;

        // track the request in analytics
        await this._analyticsService.incrementViewCountAsync(document.slug);
        
        // return view
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
        
        // check if the document exists
        const existsResult = await this._documentService.existsAsync(params.slug);
        if (!existsResult.success)
            return Error(existsResult.message);
        
        // if it exists, call update. If not, call add
        const docExists = existsResult.data;
        const result = docExists ?
            await this._documentService.updateAsync(document) :
            await this._documentService.addAsync(document);
        
        // validate document service action
        if (!result.success)
            this.BadRequest(result.message);
        
        // redirect to new / updated document
        return this.Redirect(res, params.slug);
    }

    /**
     * GET : /[slug]/edit
     * 
     * Displays the edit form for a document
     */
    @Get(":slug/edit")
    async edit(@Req() req : Request, @Res() res : Response, @Param() params) {
        if (params.slug == null)
            this.BadRequest();
        
        // get the document associated with the slug
        const result = await this._documentService.getAsync(params.slug);
        
        // if it was found, use that, if not, create a new doc
        var document = result.success ? result.data : new Document({slug: params.slug});
        
        // return edit view
        return this.View(res, "edit", { document: document, csrfToken: req.csrfToken()});
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
        
        // call to delete the document and validate success
        const result = await this._documentService.deleteAsync(params.slug);
        if (!result.success)
            this.BadRequest(result.message);
        
        // redirect to home
        return this.Redirect(res, "/");
    }
}
