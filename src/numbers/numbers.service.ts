import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNumbersDto, UpdateNumbersDto } from './dto/numbers.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Numbers, Prisma } from '@prisma/client';

@Injectable()
export class NumbersService {
  private readonly CACHE_KEY = 'asfim_numbers';
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll() {
    const numbers = await this.prisma.numbers.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    // Transform the data to the desired format
    const result: any = {};
    let lastUpdated: Date | null = null;

    numbers.forEach((item) => {
      // Track the most recent update date
      if (!lastUpdated || item.updatedAt > lastUpdated) {
        lastUpdated = item.updatedAt;
      }

      // Map specific keys to the desired format
      switch (item.key) {
        case 'rank':
          result.rank = item.value;
          break;
        case 'aum':
          result.aum = item.value;
          break;
        case 'marketShare':
          result.marketShare = item.value;
          break;
        case 'fundsCount':
          result.fundsCount = item.value;
          break;
      }
    });

    return {
      ...result,
      lastUpdated,
    };
  }
}
