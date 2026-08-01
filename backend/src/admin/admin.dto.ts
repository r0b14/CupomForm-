import { ArrayMaxSize, ArrayNotEmpty, IsArray, IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCampaignDto {
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(140) title?: string;
  @IsOptional() @IsString() @MaxLength(1000) subtitle?: string;
}

export class ImportCouponsDto {
  @IsArray() @ArrayNotEmpty() @ArrayMaxSize(5000) @IsString({ each: true }) @MaxLength(80, { each: true }) codes!: string[];
}
