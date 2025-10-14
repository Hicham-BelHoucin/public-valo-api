import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RATE_LIMIT_KEY, RateLimitConfig } from '../decorators/rate-limit.decorator';
import { RateLimitService } from '../services/rate-limit.service';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RateLimitInterceptor.name);

  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Get rate limit configuration from decorator
    const rateLimit = this.reflector.get<RateLimitConfig>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    // Skip if no rate limit is configured
    if (!rateLimit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get rate limit key prefix
    const keyPrefix = rateLimit.keyPrefix || 
                    `${context.getClass().name}:${context.getHandler().name}`;

    try {
      // Check rate limit
      const result = await this.rateLimitService.checkRateLimit(
        request,
        keyPrefix,
        rateLimit.limit,
        rateLimit.ttl,
        rateLimit.options
      );

      // Set rate limit headers
      response.header('X-RateLimit-Limit', String(rateLimit.limit));
      response.header('X-RateLimit-Remaining', String(result.remaining));
      response.header('X-RateLimit-Reset', String(Math.ceil(result.resetTime.getTime() / 1000)));

      // If rate limit exceeded, throw exception
      if (!result.success) {
        const retryAfter = Math.max(1, Math.ceil((result.resetTime.getTime() - Date.now()) / 1000));
        response.header('Retry-After', String(retryAfter));
        
        this.logger.warn(
          `Rate limit exceeded: [${request.method}] ${request.url} - Client: ${request.ip || 'unknown'} - Limit: ${rateLimit.limit}/${rateLimit.ttl}s`
        );
        
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded',
            error: 'Too Many Requests',
            retryAfter: retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (error) {
      // If the error is from our rate limit check, rethrow it
      if (error instanceof HttpException) {
        throw error;
      }
      
      // If there's an error in the rate limiting logic, log it but allow the request
      this.logger.error(
        `Error in rate limiting: ${error.message}`, 
        error.stack
      );
    }

    // Proceed with request
    return next.handle();
  }
}