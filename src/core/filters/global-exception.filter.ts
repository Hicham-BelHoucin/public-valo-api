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
 * Global filter to catch all unhandled exceptions
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Determine status code - use HTTP exception status if available
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';
    let errorName = 'ServerError';
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      errorMessage = typeof errorResponse === 'object' && 'message' in errorResponse 
        ? (errorResponse as { message: string }).message
        : exception.message;
      errorName = exception.name;
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
      errorName = exception.name;
    }
    
    // Log the error
    this.logger.error(
      `Unhandled exception: ${errorMessage}`,
      exception instanceof Error ? exception.stack : undefined
    );

    // Build standardized response
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: {
        name: errorName,
        message: errorMessage
      }
    };

    // Add request ID if available
    if (request['requestId']) {
      responseBody['requestId'] = request['requestId'];
    }

    // In production, hide detailed error for 500s
    if (status === HttpStatus.INTERNAL_SERVER_ERROR && 
        process.env.NODE_ENV === 'production') {
      responseBody.error.message = 'Internal server error';
    }

    response.status(status).json(responseBody);
  }
}