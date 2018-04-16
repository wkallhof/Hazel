import Document from "./document";
import { ServiceDataResult } from "../shared/service-result";
import { Component } from "@nestjs/common";
import DocumentMeta from "./document-meta";
import marked = require("marked");

export interface IDocumentParserService{
    convertFromStorageFormatAsync(storageFormat : string) : Promise<ServiceDataResult<Document>>
    convertToStorageFormatAsync(document: Document): Promise<ServiceDataResult<string>>
    getHtmlFromContentAsync(content: string): Promise<ServiceDataResult<string>>
}


    /*--------------------------------------------*
     *          SERVICE IMPLEMENTATION            *
     *--------------------------------------------*/

@Component()
export class MarkdownDocumentParserService implements IDocumentParserService {

    private metaRegex: RegExp = /<!--META (.*) -->/;
    private missingLinkRegex: RegExp = /\[(.*)\]\(\)/;

    public async convertFromStorageFormatAsync(storageFormat: string): Promise<ServiceDataResult<Document>> {
        if (storageFormat == null || storageFormat.length <= 0)
            return new ServiceDataResult({ success: false, message:"File content was empty"});

        const metaData = this.extractMetaData(storageFormat);
        let rawContent = this.extractContent(storageFormat);

        let document = new Document();

        // add the metadata we have
        if (metaData != null) {
            document.title = metaData.title;
            document.tags = metaData.tags;
            document.createDate = metaData.createDate;
            document.updateDate = metaData.updateDate;
        }

        // add the content we have
        if (rawContent) {
            if (rawContent.startsWith("\n"))
            rawContent = rawContent.substring(1);
            
            document.rawContent = rawContent;
        }

        return new ServiceDataResult({ success: true, data: document });
    }

    public async convertToStorageFormatAsync(document: Document): Promise<ServiceDataResult<string>> {
        if (document == null)
            return new ServiceDataResult({ success: false, message:"Document was null"});

        const metaData = new DocumentMeta({
            title: document.title,
            tags: document.tags,
            createDate: document.createDate,
            updateDate: document.updateDate
        });

        const metaString = JSON.stringify(metaData);
        const commentString = `<!--META ${metaString} -->`;
        const result = `${commentString}\n${document.rawContent}`;
        return new ServiceDataResult({ success: true, data: result });
    }

    public async getHtmlFromContentAsync(content: string): Promise<ServiceDataResult<string>>
    {
        return new ServiceDataResult({ success: true, data: marked(content) });
    }

    private extractMetaData(fileContent) : DocumentMeta {
        let meta = fileContent.match(this.metaRegex);
        if (!meta || meta.length !== 2) return null;

        return JSON.parse(meta[1]);
    }

    private extractContent(fileContent) : string {
        return fileContent.replace(this.metaRegex, "");
    }
}