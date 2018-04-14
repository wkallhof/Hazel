import { IStorageService } from "./services/storage/storage.service";
import { IDocumentParserService } from "./services/document/document-parser.service";
import { Component } from "@nestjs/common";

export class HazelConfig{

    public appTitle: string = "Hazel";

    public storageService: IStorageService;
    public documentParserService: IDocumentParserService;

    public dataDirectory: string = __dirname + "/data/";
    public contentDirectory: string = __dirname + "/content/";

    public constructor(init?:Partial<HazelConfig>) {
        Object.assign(this, init);
    }
}