import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CouponStatus, DeliveryStatus } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';
import { AdminTokenGuard } from './admin.guard';
import { ImportCouponsDto, UpdateCampaignDto } from './admin.dto';
import { AdminService } from './admin.service';
import { SubmissionService } from '../submission/submission.service';

@Controller('admin') @UseGuards(AdminTokenGuard) @Throttle({ default: { limit: 30, ttl: 60_000 } })
export class AdminController {
  constructor(private readonly admin: AdminService, private readonly submissions: SubmissionService) {}
  @Get('dashboard') dashboard() { return this.admin.dashboard(); }
  @Get('participants') participants(@Query('query') query?: string, @Query('status') status?: DeliveryStatus) { return this.admin.participants(query?.trim(), status); }
  @Get('campaign') campaign() { return this.admin.getCampaign(); }
  @Patch('campaign') updateCampaign(@Body() dto: UpdateCampaignDto) { return this.admin.updateCampaign(dto); }
  @Get('coupons') coupons(@Query('query') query?: string, @Query('status') status?: CouponStatus) { return this.admin.coupons(query?.trim(), status); }
  @Post('coupons/import') importCoupons(@Body() dto: ImportCouponsDto) { return this.admin.importCoupons(dto); }
  @Get('deliveries') deliveries(@Query('status') status?: DeliveryStatus) { return this.admin.deliveries(status); }
  @Post('deliveries/:submissionId/resend') async resend(@Param('submissionId') submissionId: string) { await this.admin.logResend(submissionId); return this.submissions.requestDelivery(submissionId); }
  @Get('history') history() { return this.admin.history(); }
}
