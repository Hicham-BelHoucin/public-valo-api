import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    
    // Log the start of the request
    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    // Capture start time
    const start = Date.now();

    // Log response after it's sent
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - start;
      
      // Use different log levels based on status code
      if (statusCode >= 500) {
        this.logger.error(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
      } else if (statusCode >= 400) {
        this.logger.warn(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
      } else {
        this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
      }
    });

    next();
  }
}