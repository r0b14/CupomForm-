// Public form submission endpoints.
import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiAcceptedResponse, ApiBadRequestResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags, ApiTooManyRequestsResponse } from '@nestjs/swagger';
import { ApiErrorResponseDto, DeliveryRequestResponseDto, SubmissionResponseDto } from '../docs/swagger.schemas';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { SubmissionService } from './submission.service';

@Controller('submissions')
@Throttle({ default: { limit: 8, ttl: 60_000 } })
@ApiTags('Submissions')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar respostas e reservar um cupom único' })
  @ApiCreatedResponse({ type: SubmissionResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto, description: 'Dados inválidos ou estoque esgotado.' })
  @ApiTooManyRequestsResponse({ type: ApiErrorResponseDto, description: 'Limite de requisições excedido.' })
  async create(@Body() dto: CreateSubmissionDto) {
    return this.submissionService.create(dto);
  }

  @Post(':id/delivery')
  @HttpCode(202)
  @ApiOperation({ summary: 'Solicitar envio do cupom por WhatsApp' })
  @ApiParam({ name: 'id', description: 'ID da resposta que recebeu o cupom', example: 'cmc4v3vjb0001l5082nq2r9eg' })
  @ApiAcceptedResponse({ type: DeliveryRequestResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  async requestDelivery(@Param('id') id: string) {
    return this.submissionService.requestDelivery(id);
  }
}
