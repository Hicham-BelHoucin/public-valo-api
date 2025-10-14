import { SetMetadata } from '@nestjs/common';

export interface RateLimitOptions {
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  identificationStrategy?: 'ip' | 'email' | 'user';
}

export interface RateLimitConfig {
  limit: number;
  ttl: number; // Time window in seconds
  keyPrefix?: string;
  options?: RateLimitOptions;
}

export const RATE_LIMIT_KEY = 'rateLimit';

export const RateLimit = (config: RateLimitConfig) =>
  SetMetadata(RATE_LIMIT_KEY, config);
