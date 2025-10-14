import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Generate a unique request ID if not already set
    const requestId = req.headers['x-request-id'] || uuidv4();
    
    // Add it to request and response
    req['requestId'] = requestId;
    res.setHeader('X-Request-ID', requestId as string);
    
    next();
  }
}
