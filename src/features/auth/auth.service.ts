import { Component, Inject } from "@nestjs/common";
import { ServiceDataResult, ServiceResult } from "../shared/service-result";
import { Request, Response } from "express";
import DI from "../../di";
import * as BasicAuth from "basic-auth";
import { HazelConfig } from "../../hazel.config";

/**
 * 
 * @export
 * @interface IAuthService
 */
export interface IAuthService{
    authenticateRequestAsync(req : Request, res : Response, next : Function) : Promise<void>
}

    /*--------------------------------------------*
     *          SERVICE IMPLEMENTATION            *
     *--------------------------------------------*/

@Component()
export class BasicAuthService implements IAuthService {

    private readonly _config: HazelConfig;

    constructor(@Inject(DI.HazelConfig) config: HazelConfig) { 
        this._config = config;
    }

    public async authenticateRequestAsync(req: Request, res: Response, next: Function): Promise<void> {
        // ensure we have some settings to compare to
        if (this._config.authSettings == null
            || !this._config.authSettings.username
            || !this._config.authSettings.password)
            next();
        
        // if so, use basic auth
        let user = BasicAuth(req);

        // check user info
        if (!user || !user.name || !user.pass ||
            user.name !== this._config.authSettings.username ||
            user.pass !== this._config.authSettings.password) {
            return this.unauthorized(req, res);
        }

        // we are good, move on
        return next();
    }

    private unauthorized(req: Request, res: Response): void {
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", "Basic realm=Authorization Required");
        res.end("Access denied");
        return;
    }
}