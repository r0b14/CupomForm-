// Campaign query service.
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveCampaign() {
    return this.prisma.campaign.findFirst({
      where: { active: true },
      select: {
        slug: true,
        title: true,
        subtitle: true,
        privacyText: true,
        questions: {
          orderBy: { position: 'asc' },
          select: {
            key: true,
            label: true,
            type: true,
            required: true,
            options: true,
            maxSelections: true,
            section: true,
          },
        },
      },
    });
  }
}
