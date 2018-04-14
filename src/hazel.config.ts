import { IStorageService } from "./features/storage/storage.service";
import { IDocumentParserService } from "./features/document/document-parser.service";
import { Component } from "@nestjs/common";

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

    public constructor(init?:Partial<HazelServices>) {
        Object.assign(this, init);
    }
}