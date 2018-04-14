export default class DocumentMeta{
    public title: string = "";
    public updateDate : number = null;
    public createDate : number = null;
    public tags : Array<string> = new Array<string>();
    
    public constructor(init?:Partial<DocumentMeta>) {
        Object.assign(this, init);
    }
}