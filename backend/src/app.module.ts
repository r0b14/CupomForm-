// Application module for the backend API.
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CampaignController } from './campaign/campaign.controller';
import { CampaignService } from './campaign/campaign.service';
import { validateEnvironment } from './config/environment';
import { HealthController } from './health/health.controller';
import { InternalController } from './internal/internal.controller';
import { PrismaService } from './prisma/prisma.service';
import { SubmissionController } from './submission/submission.controller';
import { SubmissionService } from './submission/submission.service';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]),
  ],
  controllers: [CampaignController, SubmissionController, InternalController, HealthController, AdminController],
  providers: [
    PrismaService,
    CampaignService,
    SubmissionService,
    AdminService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
