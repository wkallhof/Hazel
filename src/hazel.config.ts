import { IStorageService } from "./features/storage/storage.service";
import { IDocumentParserService } from "./features/document/document-parser.service";
import { Component } from "@nestjs/common";
import { IAnalyticsService } from "./features/analytics/analytics.service";
import { IDocumentService } from "./features/document/document.service";
import { ISearchService } from "./features/search/search.service";

export class HazelConfig{

    public appTitle: string = "Hazel";
    public dataDirectory: string = __dirname + "/data/";
    public contentDirectory: string = __dirname + "/content/";

    public constructor(init?:Partial<HazelConfig>) {
        Object.assign(this, init);
    }
}

export class HazelServices{
    public storageService: IStorageService;
    public documentParserService: IDocumentParserService;
    public analyticsService: IAnalyticsService;
    public documentsService: IDocumentService;
    public searchService: ISearchService;

    public constructor(init?:Partial<HazelServices>) {
        Object.assign(this, init);
    }
}