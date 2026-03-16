import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/http-error.js';

export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details: any = undefined;

    if (err instanceof HttpError) {
        statusCode = err.statusCode;
        message = err.message;
    } else  {
        console.error(err); 
    }

    res.status(statusCode).json({ message, details });
};