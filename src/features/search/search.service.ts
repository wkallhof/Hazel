import { Component, Inject } from "@nestjs/common";
import { ServiceDataResult, ServiceResult } from "../shared/service-result";
import DI from "../../di";
import { SearchResult } from "./search-result";
import { IDocumentService } from "../document/document.service";
import Document from "../document/document";
import * as _ from "lodash";

/**
 * 
 * @export
 * @interface ISearchService
 */
export interface ISearchService{
    searchAsync(term: string): Promise<ServiceDataResult<Array<SearchResult>>>
    indexAddAsync(document: Document): Promise<ServiceResult>
    indexUpdateAsync(document: Document): Promise<ServiceResult>
    indexRemoveAsync(document: Document): Promise<ServiceResult>
}

@Component()
export class SimpleRegexSearchService implements ISearchService {

    private readonly _documentService: IDocumentService;

    constructor(@Inject(DI.IDocumentService) documentService: IDocumentService) {
        this._documentService = documentService;
    }

    public async searchAsync(term: string): Promise<ServiceDataResult<Array<SearchResult>>> {
        var allDocumentsResult = await this._documentService.allAsync();
        if (!allDocumentsResult.success)
            return new ServiceDataResult<Array<SearchResult>>({success: false, message: allDocumentsResult.message}); 
        
        var results = _.chain(allDocumentsResult.data)
            .map((d: Document) => new SearchResult({ document: d, score: this.GetMatchingResult(term, d) }))
            .filter((r: SearchResult) => r.score != 0 )
            .orderBy((r: SearchResult) => r.score)
            .value();

        return new ServiceDataResult<Array<SearchResult>>({ success: true, data: results });
    }

    public async indexAddAsync(document: Document): Promise<ServiceResult> {
        return new ServiceResult({ success: true });
    }

    public async indexUpdateAsync(document: Document): Promise<ServiceResult> {
        return new ServiceResult({ success: true });
    }

    public async indexRemoveAsync(document: Document): Promise<ServiceResult> {
        return new ServiceResult({ success: true });
    }

    public GetMatchingResult(searchTerm: string, document: Document): number {
        var matches = document.markdown.toLowerCase().match(searchTerm.toLowerCase());
        return matches == null ? 0 : matches.length;
    }
}