import { Module, DynamicModule, ValidationPipe, INestApplication } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';
import { DocumentController } from "./controllers/document.controller";

import { IDocumentService, DocumentService } from "./services/document/document.service";
import DI from './di';
import { DocumentParserService, IDocumentParserService } from './services/document/document-parser.service';
import { MarkdownDiskStorageService, IStorageService } from './services/storage/storage.service';
import { ServiceResult } from './services/service-result';
import { NestFactory } from '@nestjs/core';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

import * as express from 'express';
import * as path from 'path';
import { HazelConfig, HazelServices } from './hazel.config';

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
            this._services.documentParserService = new DocumentParserService();
        
        // configure storage service if not set
        if (this._services.storageService == null) {
            const storageService = new MarkdownDiskStorageService(this._config, this._services.documentParserService);
            await storageService.initializeAsync();
            this._services.storageService = storageService;
        }

        // create application module
        this._app = await NestFactory.create(HazelModule.create(this._config, this._services));

        // setup server and middleware
        this._app.useGlobalPipes(new ValidationPipe());
        this._app.useGlobalFilters(new GlobalExceptionFilter());
        this._app.use(express.static(path.join(__dirname, 'public')));
        this._app.set('views', __dirname + '/views');
        this._app.set('view engine', 'ejs');

        return this._app;
    }

    async start(ip: any, port: any) {
        await this._app.listen(port, ip, () => {
            console.log("✔ Hazel server listening at %s:%d ", ip, port);
        });
    }
}

class HazelModule {
    static create(config: HazelConfig, services: HazelServices): DynamicModule {
        
        return {
            module: HazelModule,
            controllers: [HomeController, DocumentController],
            components: [
                { provide: DI.IDocumentService, useClass: DocumentService },
                { provide: DI.IDocumentParserService, useFactory: () => services.documentParserService },
                { provide: DI.IStorageService, useFactory: () => services.storageService },
                { provide: DI.HazelConfig, useFactory: () => config }
            ],
          };
    }
}
