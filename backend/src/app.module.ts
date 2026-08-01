// Application module for the backend API.
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CampaignController } from './campaign/campaign.controller';
import { CampaignService } from './campaign/campaign.service';
import { InternalController } from './internal/internal.controller';
import { PrismaService } from './prisma/prisma.service';
import { SubmissionController } from './submission/submission.controller';
import { SubmissionService } from './submission/submission.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
  ],
  controllers: [CampaignController, SubmissionController, InternalController],
  providers: [PrismaService, CampaignService, SubmissionService],
})
export class AppModule {}
