import Document from "../document/document";

export class SearchResult{
    public document: Document;
    public score: number;
    public excerpt: string;

    public constructor(init?:Partial<SearchResult>) {
        Object.assign(this, init);
    }
}