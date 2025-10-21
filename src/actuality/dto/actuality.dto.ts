import {
  IsString,
  IsOptional,
  IsUUID,
  IsDate,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

// DTO for filter parameters
export class ActualityFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  publishedAfter?: Date;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  publishedBefore?: Date;
}

// DTO for actuality response
export class ActualityResponseDto {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  link?: string | null;
  source?: string | null;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for actuality list response with pagination
export class ActualityListResponseDto {
  data: ActualityResponseDto[];
  total: number;
  page: number;
  limit: number;
}
