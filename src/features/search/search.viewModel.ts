import { SearchResult } from "./search-result";

export default class SearchViewModel{
    public title: string;
    public term: string;
    public results: Array<SearchResult>;
}