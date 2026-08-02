import { CouponStatus, DeliveryStatus } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCampaignDto {
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(140) title?: string;
  @IsOptional() @IsString() @MaxLength(1000) subtitle?: string;
}

export class ImportCouponsDto {
  @IsArray() @ArrayNotEmpty() @ArrayMaxSize(5000) @IsString({ each: true }) @MaxLength(80, { each: true }) codes!: string[];
}

export class ParticipantQueryDto {
  @IsOptional() @IsString() @MaxLength(100) query?: string;
  @IsOptional() @IsEnum(DeliveryStatus) status?: DeliveryStatus;
}

export class CouponQueryDto {
  @IsOptional() @IsString() @MaxLength(100) query?: string;
  @IsOptional() @IsEnum(CouponStatus) status?: CouponStatus;
}

export class ResponsesQueryDto {
  /** JSON `{ "<chave da pergunta>": ["valor", ...] }`. Ver AdminService.parseResponseFilters. */
  @IsOptional() @IsString() @MaxLength(4000) filters?: string;
}

export class DeliveryQueryDto {
  @IsOptional() @IsEnum(DeliveryStatus) status?: DeliveryStatus;
}
