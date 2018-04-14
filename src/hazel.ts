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

export class Hazel{
    private readonly _storageService: IStorageService;
    private readonly _documentParserService: IDocumentParserService;
    private _app: INestApplication;

    constructor(storageService: IStorageService, documentParserService: IDocumentParserService) {
        this._storageService = storageService;
        this._documentParserService = documentParserService;
    }
    
    async init() : Promise<INestApplication> {
        this._app = await NestFactory.create(HazelModule.withServices(
            this._storageService,
            this._documentParserService
        ));

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
    static withServices(
        storageService: IStorageService,
        documentParserService: IDocumentParserService): DynamicModule {
        
        return {
            module: HazelModule,
            controllers: [HomeController, DocumentController],
            components: [
                { provide: DI.IDocumentService, useClass: DocumentService },
                { provide: DI.IDocumentParserService, useFactory: () => documentParserService },
                { provide: DI.IStorageService, useFactory: () => storageService }
            ],
          };
    }
}
