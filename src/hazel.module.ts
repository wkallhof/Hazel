import { Module, DynamicModule } from '@nestjs/common';
import { HomeController } from './controllers/home.controller';
import { DocumentController } from "./controllers/document.controller";

import { IDocumentService, DocumentService } from "./services/document/document.service";
import DI from './di';
import { DocumentParserService, IDocumentParserService } from './services/document/document-parser.service';
import { MarkdownDiskStorageService, IStorageService } from './services/storage/storage.service';
import { ServiceResult } from './services/service-result';

// @Module({})
export class HazelModule {
    static WithServices(
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
