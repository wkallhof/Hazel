import Document from '../document/document';

export class HomeViewModel{
    public title: string;
    public recentDocuments: Array<Document>;
    public randomDocuments: Array<Document>;
}