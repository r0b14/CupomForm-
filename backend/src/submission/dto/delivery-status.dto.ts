// DTO used by the protected n8n callback.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class DeliveryStatusDto {
  @ApiProperty({ enum: ['SENT', 'FAILED'], example: 'SENT' })
  @IsIn(['SENT', 'FAILED'])
  status!: 'SENT' | 'FAILED';

  @ApiPropertyOptional({ example: 'wamid.HBgMNTUxMTk5OTk5MTIzNFA=' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerMessageId?: string;

  @ApiPropertyOptional({ example: 'Instância Evolution indisponível.' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  error?: string;
}
