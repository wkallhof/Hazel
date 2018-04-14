import { IsNotEmpty } from "class-validator";

export default class Document{
    @IsNotEmpty()
    public title: string = "";
    @IsNotEmpty()
    public slug: string = "";
    
    public markdown : string = "";
    public html: string = "";
    
    public updateDate : number = null;
    public createDate : number = null;
    public tags : Array<string> = new Array<string>();
    
    public constructor(init?:Partial<Document>) {
        Object.assign(this, init);
    }
}