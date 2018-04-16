import { HttpException, HttpStatus } from "@nestjs/common";
import { Response } from "express";

export class BaseController {

    public NotFound(message?:string) {
        throw new HttpException(message || "Not Found", HttpStatus.NOT_FOUND);
    }

    public BadRequest(message?:string) {
        throw new HttpException(message || "Bad Request", HttpStatus.BAD_REQUEST);
    }

    public Error(message?: string) {
        throw new HttpException(message || "Server Error", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    public View(res: Response, view : string, data?: any) {
        res.render(view, data);
    }

    public Redirect(res: Response, url: string) {
        res.redirect(url);
    }

    public Ok(res: Response) {
        res.status(200).send();
    } 
}
