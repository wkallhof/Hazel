export class ServiceDataResult<T>{
    public success: boolean;
    public data: T;
    public message: string;

    public constructor(init?:Partial<ServiceDataResult<T>>) {
        Object.assign(this, init);
    }
}

export class ServiceResult{
    public success: boolean;
    public message: string;

    public constructor(init?:Partial<ServiceResult>) {
        Object.assign(this, init);
    }
}