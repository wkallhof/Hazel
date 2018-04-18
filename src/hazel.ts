import { Module, DynamicModule, ValidationPipe, INestApplication, MiddlewaresConsumer, NestModule } from '@nestjs/common';
import { HomeController } from './features/home/home.controller';
import { DocumentController } from "./features/document/document.controller";

import { IDocumentService, DocumentService } from "./features/document/document.service";
import DI from './di';
import { MarkdownDocumentParserService, IDocumentParserService } from './features/document/document-parser.service';
import { MarkdownDiskStorageService, IStorageService } from './features/storage/storage.service';
import { ServiceResult } from './features/shared/service-result';
import { NestFactory } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

import * as express from 'express';
import * as path from 'path';
import { HazelConfig, HazelServices } from './hazel.config';
import { JsonStorageAnalyticsService } from './features/analytics/analytics.service';
import { SimpleRegexSearchService } from './features/search/search.service';
import { SearchController } from './features/search/search.controller';
import { BasicAuthService } from './features/auth/auth.service';
import { AuthMiddleware } from './features/auth/auth.middleware';

import * as cookieParser from "cookie-parser";
import { CsurfMiddleware } from '@nest-middlewares/csurf';

export class Hazel{
    private _config: HazelConfig;
    private _app: INestApplication;
    private _services: HazelServices;

    constructor(config: HazelConfig, services: HazelServices) {
        this._config = config;
        this._services = services;
    }
    
    async init(): Promise<INestApplication> {

        // configure parser service if not set
        if (this._services.documentParserService == null)
            this._services.documentParserService = new MarkdownDocumentParserService();
        
        // configure async services if not set
        await this.loadStorageService();
        await this.loadAnalyticsService();
        await this.loadDocumentsService();
        this.loadSearchService();
        this.loadAuthService();

        // create application module
        this._app = await NestFactory.create(HazelModule.create(this._config, this._services));

        // setup server and middleware
        this._app.useGlobalPipes(new ValidationPipe());
        this._app.useGlobalFilters(new GlobalExceptionFilter());
        this._app.use(cookieParser());
        this._app.use(express.static(this._config.publicDirectory));
        this._app.set('views',this._config.viewsDirectory);
        this._app.set('view engine', this._config.viewEngine);

        return this._app;
    }

    async start(ip: any, port: any) {
        await this._app.listen(port, ip, () => {
            console.log("✔ Hazel server listening at %s:%d ", ip, port);
        });
    }

    private async loadStorageService(): Promise<void> {
        if (this._services.storageService != null) return;
        
        const storageService = new MarkdownDiskStorageService(this._config, this._services.documentParserService);
        let result = await storageService.initializeAsync();
        if (!result.success)
            throw new Error(result.message);
        
        this._services.storageService = storageService;
    }

    private async loadAnalyticsService(): Promise<void> {
        if (this._services.analyticsService != null) return;

        const analyticsService = new JsonStorageAnalyticsService(this._services.storageService);
        let result = await analyticsService.initializeAsync();
        if (!result.success)
            throw new Error(result.message);
        
        this._services.analyticsService = analyticsService;
    }

    private async loadDocumentsService(): Promise<void> {
        if (this._services.documentsService != null) return;

        const documentService = new DocumentService(this._services.storageService);
        let result = await documentService.initializeAsync();
        if (!result.success)
            throw new Error(result.message);
        
        this._services.documentsService = documentService;
    }

    private loadSearchService() {
        if (this._services.searchService != null) return;
        this._services.searchService = new SimpleRegexSearchService(this._services.documentsService);
    }

    private loadAuthService() {
        if (this._services.authService != null) return;
        this._services.authService = new BasicAuthService(this._config);
    }
}

class HazelModule implements NestModule {

    static create(config: HazelConfig, services: HazelServices): DynamicModule {

        return {
            module: HazelModule,
            controllers: [SearchController, HomeController, DocumentController],
            components: [
                { provide: DI.IDocumentService, useFactory: () => services.documentsService },
                { provide: DI.IDocumentParserService, useFactory: () => services.documentParserService },
                { provide: DI.IStorageService, useFactory: () => services.storageService },
                { provide: DI.IAnalyticsService, useFactory: () => services.analyticsService },
                { provide: DI.ISearchService, useFactory: () => services.searchService },
                { provide: DI.IAuthService, useFactory: () => services.authService },
                { provide: DI.HazelConfig, useFactory: () => config }
            ],
          };
    }

    configure(consumer: MiddlewaresConsumer): void {
        CsurfMiddleware.configure({ cookie: true });
        consumer.apply([CsurfMiddleware,AuthMiddleware]).forRoutes(SearchController, HomeController, DocumentController);
      }
}
