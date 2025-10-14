import { IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateNumbersDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  key: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateNumbersDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  key?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  value?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  description?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}