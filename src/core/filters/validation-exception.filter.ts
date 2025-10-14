import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError } from 'class-validator';
import { HttpExceptionFilter } from './http-exception.filter';

/**
 * Filter specifically for handling validation errors
 */
@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();

    // Check if this is a validation error
    const isValidationError = this.isValidationError(errorResponse);

    // If not a validation error, let the HttpExceptionFilter handle it
    if (!isValidationError) {
      const httpExceptionFilter = new HttpExceptionFilter();
      return httpExceptionFilter.catch(exception, host);
    }

    // Extract and format validation errors
    const validationErrors = this.formatValidationErrors(errorResponse);

    // Log validation errors
    this.logger.warn(
      `Validation failed: [${request.method}] ${request.url} - ${validationErrors.length} errors`,
    );

    // Build standardized response
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: {
        name: 'ValidationError',
        message: 'Validation failed',
      },
      errors: validationErrors,
    };

    // Add request ID if available
    if (request['requestId']) {
      responseBody['requestId'] = request['requestId'];
    }

    response.status(status).json(responseBody);
  }

  // Check if the exception is related to validation
  private isValidationError(errorResponse: any): boolean {
    return (
      typeof errorResponse === 'object' &&
      (('message' in errorResponse && Array.isArray(errorResponse.message)) ||
        ('errors' in errorResponse && Array.isArray(errorResponse.errors)))
    );
  }

  // Format validation errors into a standard structure
  private formatValidationErrors(errorResponse: any): any[] {
    let errors = [];

    // Handle different error formats
    if ('errors' in errorResponse && Array.isArray(errorResponse.errors)) {
      errors = errorResponse.errors;
    } else if (
      'message' in errorResponse &&
      Array.isArray(errorResponse.message)
    ) {
      errors = errorResponse.message.map((msg) => ({
        property: this.extractProperty(msg),
        constraints: [msg],
      }));
    }

    // Normalize format
    return errors.map((error: any) => ({
      field: error.property,
      message: Array.isArray(error.constraints)
        ? error.constraints[0]
        : Object.values(error.constraints || {}).join(', '),
      value: error.value,
    }));
  }

  // Extract property name from validation message
  private extractProperty(message: string): string {
    // Common formats like "property should not be empty"
    const match = message.match(/^([a-zA-Z0-9]+)\s+should/);
    return match ? match[1] : 'unknown';
  }
}
