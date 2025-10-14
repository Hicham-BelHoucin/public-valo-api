import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

// Import SetMetadata
import { SetMetadata } from '@nestjs/common';

/**
 * Type definition for cache control settings
 */
export enum CacheControlDirective {
  PUBLIC = 'public',
  PRIVATE = 'private',
  NO_CACHE = 'no-cache',
  NO_STORE = 'no-store',
  MUST_REVALIDATE = 'must-revalidate',
}

export interface CacheControlOptions {
  directive: CacheControlDirective;
  maxAge?: number;
  sMaxAge?: number;
  staleWhileRevalidate?: number;
}

// Metadata key for cache control settings
export const CACHE_CONTROL_KEY = 'cache-control';

// Decorator to set cache control for specific endpoints
export const CacheControl = (options: CacheControlOptions) => 
  SetMetadata(CACHE_CONTROL_KEY, options);

/**
 * Interceptor to add Cache-Control headers to HTTP responses
 */
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheControlInterceptor.name);
  private readonly defaultCacheControl: string;

  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {
    // Default cache control policy for API (no caching by default)
    this.defaultCacheControl = this.configService.get<string>(
      'DEFAULT_CACHE_CONTROL', 
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if the response should be processed
    const request = context.switchToHttp().getRequest();
    
    // Skip processing for non-GET methods
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Get route-specific cache control if set
    const handler = context.getHandler();
    const cacheControl = this.reflector.get<CacheControlOptions>(CACHE_CONTROL_KEY, handler);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        
        if (cacheControl) {
          // Build Cache-Control header from options
          const headerValue = this.buildCacheControlHeader(cacheControl);
          response.header('Cache-Control', headerValue);
          
          this.logger.debug(
            `Cache-Control set for ${request.method} ${request.url}: ${headerValue}`
          );
        } else {
          // Use default cache control
          response.header('Cache-Control', this.defaultCacheControl);
        }
        
        // Add Pragma for HTTP 1.0 compatibility
        response.header('Pragma', 'no-cache');
        response.header('Expires', '0');
      }),
    );
  }

  /**
   * Build Cache-Control header value from options
   */
  private buildCacheControlHeader(options: CacheControlOptions): string {
    let headerParts = [options.directive as any];
    
    if (options.maxAge !== undefined) {
      headerParts.push(`max-age=${options.maxAge}`);
    }
    
    if (options.sMaxAge !== undefined) {
      headerParts.push(`s-maxage=${options.sMaxAge}`);
    }
    
    if (options.staleWhileRevalidate !== undefined) {
      headerParts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }
    
    if (options.directive === CacheControlDirective.PRIVATE || 
        options.directive === CacheControlDirective.NO_CACHE) {
      headerParts.push('must-revalidate');
      headerParts.push('proxy-revalidate');
    }
    
    return headerParts.join(', ');
  }
}