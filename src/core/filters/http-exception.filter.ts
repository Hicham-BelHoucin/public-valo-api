import { 
  ExceptionFilter, 
  Catch, 
  ArgumentsHost, 
  HttpException, 
  HttpStatus,
  Logger 
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filter for handling HTTP exceptions with standardized format
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();
    
    // Extract error details
    const errorMessage = typeof errorResponse === 'object' && 'message' in errorResponse 
      ? errorResponse['message']
      : exception.message;
      
    const errorName = exception.name;
    
    // Log the error (include stack trace for 5xx errors)
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status} - ${errorMessage}`,
        exception.stack
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status} - ${errorMessage}`
      );
    }
    
    // Build standardized error response
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: {
        name: errorName,
        message: errorMessage
      },
      // Include validation errors if available
      ...(typeof errorResponse === 'object' && 'errors' in errorResponse 
        ? { errors: errorResponse['errors'] } 
        : {})
    };

    // Add request ID if available
    if (request['requestId']) {
      responseBody['requestId'] = request['requestId'];
    }

    // For 429 Too Many Requests, include retry-after header
    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      const retryAfter = typeof errorResponse === 'object' && 'retryAfter' in errorResponse
        ? errorResponse['retryAfter']
        : 60; // Default to 60 seconds
        
      response.header('Retry-After', String(retryAfter));
    }

    response.status(status).json(responseBody);
  }
}