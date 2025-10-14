import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: Date;
}

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async checkRateLimit(
    request: any,
    keyPrefix: string,
    limit: number,
    ttl: number,
    options?: any,
  ): Promise<RateLimitResult> {
    try {
      // Generate rate limit key
      const key = this.generateKey(request, keyPrefix, options);

      // Get current count
      const currentCount = (await this.cacheManager.get<number>(key)) || 0;

      // Check if limit exceeded
      if (currentCount >= limit) {
        // Get TTL to calculate reset time
        const ttlMs = await this.cacheManager.ttl(key);
        const resetTime = new Date(
          Date.now() + (ttlMs && ttlMs > 0 ? ttlMs : ttl * 1000),
        );

        return {
          success: false,
          remaining: 0,
          resetTime,
        };
      }

      // Increment counter
      const newCount = currentCount + 1;
      await this.cacheManager.set(key, newCount, ttl * 1000);

      const remaining = Math.max(0, limit - newCount);
      const resetTime = new Date(Date.now() + ttl * 1000);

      return {
        success: true,
        remaining,
        resetTime,
      };
    } catch (error) {
      this.logger.error(
        `Rate limit check failed: ${error.message}`,
        error.stack,
      );

      // On error, allow the request but log the issue
      return {
        success: true,
        remaining: limit - 1,
        resetTime: new Date(Date.now() + ttl * 1000),
      };
    }
  }

  private generateKey(request: any, keyPrefix: string, options?: any): string {
    let key = keyPrefix;

    // Add IP address
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    key += `:${ip}`;

    // Add user ID if authenticated
    if (request.user?.id) {
      key += `:user:${request.user.id}`;
    }

    // Use custom key generator if provided
    if (options?.keyGenerator) {
      key = options.keyGenerator(request);
    }

    return key;
  }
}
