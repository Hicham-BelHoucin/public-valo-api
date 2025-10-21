import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActualityFilterDto,
  ActualityListResponseDto,
  ActualityResponseDto,
} from './dto/actuality.dto';

@Injectable()
export class ActualityService {
  constructor(private prisma: PrismaService) {}

  // Get all actualities with pagination and filtering
  async findAll(
    filter?: ActualityFilterDto,
  ): Promise<ActualityListResponseDto> {
    // Pagination parameters
    const page = filter?.page ? parseInt(filter.page, 10) : 1;
    const limit = filter?.limit ? parseInt(filter.limit, 10) : 20;

    // Build where clause for filtering
    const where: any = {};

    // Search filter
    if (filter?.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { content: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // Date range filters
    if (filter?.publishedAfter) {
      where.publishedAt = { ...where.publishedAt, gte: filter.publishedAfter };
    }

    if (filter?.publishedBefore) {
      where.publishedAt = { ...where.publishedAt, lte: filter.publishedBefore };
    }

    const [actualities, total] = await this.prisma.$transaction([
      this.prisma.actuality.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.actuality.count({ where }),
    ]);

    return {
      data: actualities,
      total,
      page,
      limit,
    };
  }

  // Get a single actuality by ID
  async findOne(id: string): Promise<ActualityResponseDto> {
    const actuality = await this.prisma.actuality.findUnique({
      where: { id },
    });

    if (!actuality) {
      throw new NotFoundException('Actuality not found');
    }

    return actuality;
  }

  // Get latest actualities (for homepage or featured section)
  async findLatest(limit: number = 5): Promise<ActualityResponseDto[]> {
    const actualities = await this.prisma.actuality.findMany({
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    return actualities;
  }
}
