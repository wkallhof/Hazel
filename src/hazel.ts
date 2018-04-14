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
import { HazelConfig } from './hazel.config';

export class Hazel{
    private _config: HazelConfig;
    private _app: INestApplication;

    constructor(config: HazelConfig) {
        this._config = config;
    }
    
    async init(): Promise<INestApplication> {

        // configure parser service if not set
        if (this._config.documentParserService == null)
            this._config.documentParserService = new DocumentParserService();
        
        // configure storage service if not set
        if (this._config.storageService == null) {
            const storageService = new MarkdownDiskStorageService(this._config.documentParserService);
            await storageService.initializeAsync();
            this._config.storageService = storageService;
        }

        // create application module
        this._app = await NestFactory.create(HazelModule.create(this._config));

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
    static create(config: HazelConfig): DynamicModule {
        
        return {
            module: HazelModule,
            controllers: [HomeController, DocumentController],
            components: [
                { provide: DI.IDocumentService, useClass: DocumentService },
                { provide: DI.IDocumentParserService, useFactory: () => config.documentParserService },
                { provide: DI.IStorageService, useFactory: () => config.storageService },
                { provide: DI.HazelConfig, useFactory: () => config }
            ],
          };
    }
}
