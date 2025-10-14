import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly keyPrefix: string;
  private readonly redisEnabled: boolean;

  // Keep track of blacklisted tokens in memory (for synchronous access)
  private memoryCache: Map<string, boolean> = new Map();

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.keyPrefix = 'blacklist:token:';
  }

  /**
   * Blacklist a token by its JWT ID (jti)
   * @param jti The JWT ID
   * @param expireInSeconds Time until token naturally expires (for blacklist TTL)
   */
  async blacklist(jti: string, expireInSeconds: number): Promise<void> {
    try {
      // Store in Redis
      await this.cacheManager.set(
        `${this.keyPrefix}${jti}`, 
        'blacklisted', 
        expireInSeconds * 1000 // TTL in milliseconds
      );
      
      // Also store in memory for synchronous lookup
      this.memoryCache.set(jti, true);
      
      // Set a timeout to clear from memory when expired
      setTimeout(() => {
        this.memoryCache.delete(jti);
      }, expireInSeconds * 1000);
      
      this.logger.debug(`Token blacklisted: ${jti} for ${expireInSeconds} seconds`);
    } catch (error) {
      this.logger.error(`Failed to blacklist token: ${error.message}`);
    }
  }

  /**
   * Synchronously check if a token is blacklisted (using memory cache)
   * This allows it to be used directly in handleRequest without async/await
   * @param jti The JWT ID to check
   */
  isBlacklistedSync(jti: string): boolean {
    if (!jti) {
      return false;
    }
    
    // Check in memory first (fast)
    return this.memoryCache.get(jti) === true;
  }

  /**
   * Check if a token is blacklisted using Redis (async)
   * @param jti The JWT ID to check
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    if (!jti) {
      return false;
    }
    
    // Check in memory first (fast)
    if (this.memoryCache.get(jti) === true) {
      return true;
    }
    
    try {
      const result = await this.cacheManager.get(`${this.keyPrefix}${jti}`);
      const isBlacklisted = result !== null && result !== undefined;
      
      // Update memory cache for future sync checks
      if (isBlacklisted) {
        this.memoryCache.set(jti, true);
      }
      
      return isBlacklisted;
    } catch (error) {
      this.logger.error(`Failed to check token blacklist: ${error.message}`);
      return false;
    }
  }

  /**
   * Blacklist all tokens for a specific user
   * @param userId The user ID
   * @param expireInSeconds Time until the longest-lived token naturally expires
   */
  async blacklistUserTokens(userId: string, expireInSeconds: number): Promise<void> {
    if (!this.redisEnabled) {
      this.logger.debug(`Redis disabled - skipping blacklisting user tokens for: ${userId}`);
      return;
    }
    
    try {
      // We create a secondary index to track tokens by user
      const userKey = `blacklist:user:${userId}`;
      
      // Set this as a placeholder to indicate user tokens are invalidated
      // Store the current timestamp so we can compare token issue times
      await this.cacheManager.set(
        userKey, 
        Date.now().toString(), 
        expireInSeconds * 1000
      );
      
      this.logger.debug(`All tokens blacklisted for user: ${userId} for ${expireInSeconds} seconds`);
    } catch (error) {
      this.logger.error(`Failed to blacklist user tokens: ${error.message}`);
      // Still return success - we don't want to fail the request if blacklisting fails
    }
  }

  /**
   * Check if a user's tokens have been globally invalidated
   * @param userId The user ID
   * @param tokenIssuedAt The iat (issued at) claim from the JWT token as a Unix timestamp
   * @returns True if all user's tokens were invalidated after this token was issued
   */
  async areUserTokensInvalidated(userId: string, tokenIssuedAt: number): Promise<boolean> {
    if (!this.redisEnabled) {
      this.logger.debug(`Redis disabled - skipping token invalidation check for user: ${userId}`);
      return false;
    }
    
    try {
      const userKey = `blacklist:user:${userId}`;
      const invalidationTime = await this.cacheManager.get<string>(userKey);
      
      if (!invalidationTime) {
        return false;
      }
      
      // Add a buffer of 2 seconds to account for processing time differences
      const adjustedTokenTime = tokenIssuedAt * 1000 + 2000;
      const isInvalidated = adjustedTokenTime < parseInt(invalidationTime);
      
      if (isInvalidated) {
        this.logger.debug(`User tokens invalidated at ${invalidationTime}, token issued at ${tokenIssuedAt * 1000}`);
      }
      
      return isInvalidated;
    } catch (error) {
      this.logger.error(`Failed to check user token invalidation: ${error.message}`);
      // If we can't check, assume the token is valid
      return false;
    }
  }
}