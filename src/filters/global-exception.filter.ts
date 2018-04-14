import { ExceptionFilter, Catch } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception, response: Response) {

    let message;
    let status;
      
    if (exception instanceof HttpException) {
        status = exception.getStatus();
        message = exception.getResponse;
    } else {
        status = 500;
        message = 'Internal error';
    }
    
      const result = {
          error: {
              status: status,
              message: JSON.stringify(exception.message),
          }
      };
      
    response
      .status(status)
      .render("error", result);
  }
}