import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { RateLimitService } from './services/rate-limit.service';
import { RequestValidationInterceptor } from './interceptors/request-validation.interceptor';
import { CacheControlInterceptor } from './interceptors/cache-control.interceptor';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { RequestIdMiddleware } from './middlewares/request-id.middleware';
import { RequestLoggerMiddleware } from './middlewares/request-logger.middleware';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');

        if (redisUrl) {
          // Use Redis for caching
          return {
            store: redisStore,
            url: redisUrl,
            ttl: 60 * 60 * 1000, // 1 hour default TTL
          };
        } else {
          // Fallback to in-memory cache
          return {
            ttl: 60 * 60 * 1000, // 1 hour default TTL
          };
        }
      },
    }),
  ],
  providers: [
    TokenBlacklistService,
    RateLimitService,
    RequestIdMiddleware,
    RequestLoggerMiddleware,
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestValidationInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheControlInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
  exports: [
    TokenBlacklistService,
    RateLimitService,
    CacheModule,
    RequestIdMiddleware,
    RequestLoggerMiddleware,
  ],
})
export class CoreModule {}
