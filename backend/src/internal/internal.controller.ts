// Protected callback endpoints for n8n.
import { Body, Controller, Headers, Param, Patch, UnauthorizedException } from '@nestjs/common';
import { DeliveryStatusDto } from '../submission/dto/delivery-status.dto';
import { SubmissionService } from '../submission/submission.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiSecurity, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiErrorResponseDto, DeliveryStatusResponseDto } from '../docs/swagger.schemas';

@Controller('internal/deliveries')
@ApiTags('Internal (n8n)')
@ApiSecurity('internal-secret')
export class InternalController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar o status de uma entrega pelo callback n8n' })
  @ApiParam({ name: 'id', description: 'ID da solicitação de entrega', example: 'cmc4v3vjb0002l5085gqh4qld' })
  @ApiBody({ type: DeliveryStatusDto })
  @ApiOkResponse({ type: DeliveryStatusResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async updateStatus(
    @Param('id') id: string,
    @Headers('x-internal-secret') secret: string | undefined,
    @Body() dto: DeliveryStatusDto,
  ) {
    if (!secret || secret !== process.env.INTERNAL_CALLBACK_SECRET) {
      throw new UnauthorizedException('Credencial interna inválida.');
    }
    return this.submissionService.updateDeliveryStatus(id, dto);
  }
}
