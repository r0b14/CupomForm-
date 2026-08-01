// Public campaign endpoint.
import { Controller, Get, NotFoundException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CampaignService } from './campaign.service';
import { ApiErrorResponseDto, CampaignResponseDto } from '../docs/swagger.schemas';

@Controller('campaign')
@ApiTags('Campaign')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Obter a campanha pública ativa' })
  @ApiOkResponse({ type: CampaignResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto, description: 'Nenhuma campanha ativa.' })
  async getActiveCampaign() {
    const campaign = await this.campaignService.getActiveCampaign();
    if (!campaign) throw new NotFoundException('Nenhuma campanha ativa foi encontrada.');
    return campaign;
  }
}
