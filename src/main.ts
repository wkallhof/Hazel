import * as express from 'express';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { HazelModule } from './hazel.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { DocumentParserService } from './services/document/document-parser.service';
import { MarkdownDiskStorageService } from './services/storage/storage.service';

async function bootstrap() {

    var documentParserService = new DocumentParserService()
    var storageService = new MarkdownDiskStorageService(documentParserService);

    const app = await NestFactory.create(HazelModule.WithServices(
        storageService,
        documentParserService
    ));
    
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.use(express.static(path.join(__dirname, 'public')));
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
	await app.listen(3000);
}
bootstrap();
