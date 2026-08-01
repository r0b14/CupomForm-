import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Informe um WhatsApp brasileiro válido.' })
  message!: string | string[];

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}

export class QuestionResponseDto {
  @ApiProperty({ example: 'interesse' })
  key!: string;

  @ApiProperty({ example: 'Qual produto mais chama sua atenção?' })
  label!: string;

  @ApiProperty({ enum: ['SINGLE_CHOICE', 'TEXT'], example: 'SINGLE_CHOICE' })
  type!: 'SINGLE_CHOICE' | 'TEXT';

  @ApiProperty({ example: true })
  required!: boolean;

  @ApiPropertyOptional({ type: [String], example: ['Novidades', 'Ofertas', 'Atendimento'] })
  options!: string[] | null;
}

export class CampaignResponseDto {
  @ApiProperty({ example: 'campanha-inicial' })
  slug!: string;

  @ApiProperty({ example: 'Ganhe seu cupom exclusivo' })
  title!: string;

  @ApiPropertyOptional({ example: 'Responda rapidinho e receba seu benefício.' })
  subtitle!: string | null;

  @ApiProperty({ example: 'Autorizo o tratamento dos meus dados para esta campanha.' })
  privacyText!: string;

  @ApiProperty({ type: [QuestionResponseDto] })
  questions!: QuestionResponseDto[];
}

export class SubmissionResponseDto {
  @ApiProperty({ example: 'cmc4v3vjb0001l5082nq2r9eg' })
  submissionId!: string;

  @ApiProperty({ example: 'GENTE10' })
  couponCode!: string;

  @ApiProperty({ example: false, description: 'Indica que o telefone já possuía um cupom nesta campanha.' })
  isExisting!: boolean;
}

export class DeliveryRequestResponseDto {
  @ApiProperty({ enum: ['PENDING', 'DISPATCHED', 'SENT', 'FAILED'], example: 'DISPATCHED' })
  status!: 'PENDING' | 'DISPATCHED' | 'SENT' | 'FAILED';

  @ApiProperty({ example: 'cmc4v3vjb0002l5085gqh4qld' })
  deliveryId!: string;

  @ApiPropertyOptional({ example: true, description: 'Indica se o webhook n8n está configurado.' })
  configured?: boolean;
}

export class DeliveryStatusResponseDto {
  @ApiProperty({ example: 'cmc4v3vjb0002l5085gqh4qld' })
  id!: string;

  @ApiProperty({ enum: ['SENT', 'FAILED'], example: 'SENT' })
  status!: 'SENT' | 'FAILED';

  @ApiProperty({ example: '2026-07-31T23:50:00.000Z' })
  updatedAt!: string;
}
