import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Metadata key for request DTO
export const REQUEST_DTO_KEY = 'request-dto';

// Decorator to define which DTO should be used for validation
export const ValidateRequest = (dto: any) => SetMetadata(REQUEST_DTO_KEY, dto);

// Import SetMetadata
import { SetMetadata } from '@nestjs/common';

@Injectable()
export class RequestValidationInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestValidationInterceptor.name);

  constructor(private reflector: Reflector) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { body } = request;
    
    // Skip validation if no body or empty body
    if (!body || Object.keys(body).length === 0) {
      return next.handle();
    }
    
    // Check if there's a DTO class to validate against
    const handler = context.getHandler();
    const dto = this.reflector.get(REQUEST_DTO_KEY, handler);
    
    if (dto) {
      // Transform plain object to class instance
      const object = plainToClass(dto, body);
      
      try {
        // Validate
        const errors = await validate(object, {
          whitelist: true, // Remove non-whitelisted properties
          forbidNonWhitelisted: true, // Throw error on non-whitelisted properties
          skipMissingProperties: false, // Don't skip missing required properties
          validationError: {
            target: false, // Don't include target object in error
            value: true, // Include the invalid value
          }
        });
        
        if (errors.length > 0) {
          // Format validation errors
          const formattedErrors = errors.map(error => {
            const constraints = error.constraints ? Object.values(error.constraints) : [];
            return {
              property: error.property,
              value: error.value,
              constraints: constraints,
            };
          });
          
          this.logger.warn(
            `Validation failed: [${request.method}] ${request.url} - ${errors.length} errors`
          );
          
          throw new BadRequestException({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Validation failed',
            errors: formattedErrors,
          });
        }
        
        // Update request body with validated and transformed object
        request.body = object;
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        
        this.logger.error(
          `Error during request validation: ${error.message}`,
          error.stack
        );
        
        throw new BadRequestException('Invalid request data');
      }
    }
    
    return next.handle();
  }
}