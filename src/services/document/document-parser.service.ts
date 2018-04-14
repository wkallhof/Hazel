import Document from "./document";
import { ServiceDataResult } from "../service-result";
import { Component } from "@nestjs/common";
import DocumentMeta from "./document-meta";

export interface IDocumentParserService{
    getDocumentFromFileContentAsync(fileContent : string) : Promise<ServiceDataResult<Document>>
    convertDocumentToFileContentAsync(document : Document) : Promise<ServiceDataResult<string>>
}

@Component()
export class DocumentParserService implements IDocumentParserService {

    private metaRegex: RegExp = /<!--META (.*) -->/;
    private missingLinkRegex: RegExp = /\[(.*)\]\(\)/;

    public async getDocumentFromFileContentAsync(fileContent: string): Promise<ServiceDataResult<Document>> {
        if (fileContent == null || fileContent.length <= 0)
            return new ServiceDataResult({ success: false, message:"File content was empty"});

        const metaData = this.extractMetaData(fileContent);
        let markdown = this.extractContent(fileContent);

        let document = new Document();

        // add the metadata we have
        if (metaData != null) {
            document.title = metaData.title;
            document.tags = metaData.tags;
            document.createDate = metaData.createDate;
            document.updateDate = metaData.updateDate;
        }

        // add the content we have
        if (markdown) {
            if (markdown.startsWith("\n"))
                markdown = markdown.substring(1);
            
            document.markdown = markdown;
        }

        return new ServiceDataResult({ success: true, data: document });
    }

    public async convertDocumentToFileContentAsync(document: Document): Promise<ServiceDataResult<string>> {
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
        const result = `${commentString}\n${document.markdown}`;
        return new ServiceDataResult({ success: true, data: result });
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