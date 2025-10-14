import {
  IsString,
  IsOptional,
  IsNumber,
  IsDate,
  IsArray,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  ValidateNested,
  IsISO8601,
  MaxLength,
  Min,
  Max,
  IsEnum,
  ArrayNotEmpty,
  ValidateIf,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
// FundUserRole enum - using string literals instead
export enum FundUserRole {
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER',
}

export class PerformanceDto {
  @IsOptional()
  id?: number;

  @IsOptional()
  computed?: boolean;

  @IsOptional()
  an?: number;

  @IsOptional()
  beginnig_of_year?: number;
  // beginning_of_year?: number;

  @IsOptional()
  @IsString()
  date?: string; // ISO string

  @IsOptional()
  is_hebdomadaire?: boolean;

  @IsOptional()
  distribution?: number;

  @IsOptional()
  five_years?: number;

  @IsOptional()
  one_day?: number | null;

  @IsOptional()
  one_month?: number;

  @IsOptional()
  one_week?: number;

  @IsOptional()
  one_year?: number;

  @IsOptional()
  six_months?: number;

  @IsOptional()
  split?: number;

  @IsOptional()
  three_months?: number;

  @IsOptional()
  three_years?: number;

  @IsOptional()
  two_years?: number;

  @IsOptional()
  vl?: number;

  @IsOptional()
  vl_retraitee?: number;
}
// DTO for creating a new category within fund creation
export class NewCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameEn: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameFr: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsString()
  @IsOptional()
  descriptionFr?: string;
}

// Base DTO with common fields for both create and update
export class BaseFundDto {
  constructor() {
    console.log('BaseFundDto constructor');
  }
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fundCode: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nameEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nameFr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @IsNumber()
  @IsOptional()
  navValue?: number;

  @IsISO8601()
  @IsOptional()
  navDate?: Date;

  @IsNumber()
  @IsOptional()
  dailyChangePercentage?: number;

  @IsNumber()
  @IsOptional()
  yearPerformancePercentage?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  legalFormEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  legalFormFr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  maroclearCode?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsISO8601()
  @IsOptional()
  creationDate?: Date;

  @IsNumber()
  @IsOptional()
  initialNav?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  resultsAllocationEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  resultsAllocationFr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  navFrequencyEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  navFrequencyFr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subscribersEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subscribersFr?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  distributors?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  maxSubscriptionFee?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  maxRedemptionFee?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  maxManagementFee?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  minimumSubscriptionEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  minimumSubscriptionFr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  orderSubmissionTimeEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  orderSubmissionTimeFr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  investmentHorizonEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  investmentHorizonFr?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  benchmarkIndex?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  sensitivityRange?: string;

  @IsString()
  @IsOptional()
  strategyEn?: string;

  @IsString()
  @IsOptional()
  strategyFr?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformanceDto) // ← put this back
  ytdPerformance?: PerformanceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformanceDto)
  oneYearPerformance?: PerformanceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformanceDto)
  twoYearPerformance?: PerformanceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformanceDto)
  threeYearPerformance?: PerformanceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PerformanceDto)
  maxPerformance?: PerformanceDto[];
}

// DTO for valorisation items
export class ValorisationItemDto {
  @IsNumber()
  amount: number;

  @IsISO8601()
  date: string;
}

// DTO for document items
export class DocumentItemDto {
  @IsString()
  file_name: string;

  @IsString()
  file_path: string;
}

// DTO for creating a new fund with enhanced category and manager support
export class CreateFundDto extends BaseFundDto {
  // Optional new category to create
  @ValidateNested()
  @Type(() => NewCategoryDto)
  @IsOptional()
  newCategory?: NewCategoryDto;

  // Managers to assign to the fund
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  managers?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValorisationItemDto)
  @IsOptional()
  valorisation?: ValorisationItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentItemDto)
  @IsOptional()
  documents?: DocumentItemDto[];
}

// DTO for fund translations per locale
export class FundTranslationDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  legalForm?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  resultsAllocation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  navFrequency?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subscribers?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  minimumSubscription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  orderSubmissionTime?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  investmentHorizon?: string;

  @IsString()
  @IsOptional()
  strategy?: string;
}

// DTO for distributor
export class DistributorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string;
}

// DTO for fund user assignment
export class FundUserAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(FundUserRole)
  @IsNotEmpty()
  role: FundUserRole;
}

// DTO for updating an existing fund (matches frontend structure)
export class UpdateFundDto {
  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  maroclearCode?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10000)
  maxSubscriptionFeeBps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10000)
  maxRedemptionFeeBps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10000)
  maxManagementFeeBps?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  benchmarkIndex?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  sensitivityRange?: string;

  @IsOptional()
  @IsObject()
  translations?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistributorDto)
  @IsOptional()
  distributors?: DistributorDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundUserAssignmentDto)
  @IsOptional()
  fundUserAssignments?: FundUserAssignmentDto[];
}

// DTO for preview update (matches frontend structure)
export class UpdatePreviewFundDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  benchmarkIndex?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  sensitivityRange?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10000)
  maxSubscriptionFeeBps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10000)
  maxRedemptionFeeBps?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10000)
  maxManagementFeeBps?: number;

  @IsNumber()
  @IsOptional()
  navValue?: number; // Decimal as number

  @IsISO8601()
  @IsOptional()
  navDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  note?: string;

  @IsOptional()
  @IsObject()
  translations?: Record<string, any>;
}

// DTO for applying preview changes to production
export class ApplyPreviewChangesDto {
  @IsUUID()
  @IsNotEmpty()
  fundId: string;
}

// DTO for filter parameters
export class FundFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  hasPreviewChanges?: boolean;

  @IsString()
  @IsOptional()
  page?: string;

  @IsString()
  @IsOptional()
  limit?: string;

  @IsString()
  @IsOptional()
  locale?: string;
}

// DTO for external update
export class ExternalUpdateFundDto extends UpdateFundDto {
  // External updates need the API key, which will be validated in the guard
}

// DTO for updating fund managers separately
export class UpdateFundManagersDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayNotEmpty()
  managers: string[];
}

export class CreateFundAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  fundId: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsEnum(FundUserRole)
  @IsNotEmpty()
  role: FundUserRole;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateFundAssignmentDto {
  @IsEnum(FundUserRole)
  @IsOptional()
  role?: FundUserRole;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class FundAssignmentResponseDto {
  id: string;
  fundId: string;
  fundName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: FundUserRole;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameEn: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nameFr: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsString()
  @IsOptional()
  descriptionFr?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  code?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nameEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  nameFr?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsString()
  @IsOptional()
  descriptionFr?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CategoryResponseDto {
  id: string;
  code: string;
  nameEn: string;
  nameFr: string;
  descriptionEn?: string;
  descriptionFr?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for performance query parameters
export class PerformanceQueryDto {
  @IsString()
  @IsNotEmpty()
  fundId: string;

  @IsISO8601()
  @IsNotEmpty()
  startDate: string;

  @IsISO8601()
  @IsNotEmpty()
  endDate: string;
}

// DTO for performance response
export class PerformanceResponseDto {
  fundId: string;
  fundCode: string;
  performance: {
    date: string;
    nav: number;
    dailyChangeBps?: number;
    ytdPerformanceBps?: number;
  }[];
  summary: {
    periodStartNav?: number;
    periodEndNav?: number;
    totalReturn?: number;
    maxNav?: number;
    minNav?: number;
    volatility?: number;
    totalDays?: number;
    // Additional performance metrics
    yesterdayPerformance?: number;
    lastVariation?: number;
    lastNavDate?: string;
    // Performance metrics for different time periods
    dailyPerformance?: number;
    oneMonthPerformance?: number;
    threeMonthsPerformance?: number;
    oneYearPerformance?: number;
    twoYearsPerformance?: number;
    ytdPerformance?: number;
    sinceStartPerformance?: number;
  };
}
