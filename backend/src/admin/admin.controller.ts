import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminTokenGuard } from './admin.guard';
import {
  CouponQueryDto,
  DeliveryQueryDto,
  ImportCouponsDto,
  ParticipantQueryDto,
  UpdateCampaignDto,
} from './admin.dto';
import { AdminService } from './admin.service';
import { SubmissionService } from '../submission/submission.service';

@ApiTags('Administração')
@ApiBearerAuth('admin-token')
@Controller('admin')
@UseGuards(AdminTokenGuard)
@Throttle({ default: { limit: 30, ttl: 60_000 } })
export class AdminController {
  constructor(private readonly admin: AdminService, private readonly submissions: SubmissionService) {}
  @Get('dashboard') dashboard() { return this.admin.dashboard(); }
  @Get('participants') participants(@Query() query: ParticipantQueryDto) { return this.admin.participants(query.query?.trim(), query.status); }
  @Get('responses') responses() { return this.admin.responses(); }
  @Get('campaign') campaign() { return this.admin.getCampaign(); }
  @Patch('campaign') updateCampaign(@Body() dto: UpdateCampaignDto) { return this.admin.updateCampaign(dto); }
  @Get('coupons') coupons(@Query() query: CouponQueryDto) { return this.admin.coupons(query.query?.trim(), query.status); }
  @Post('coupons/import') importCoupons(@Body() dto: ImportCouponsDto) { return this.admin.importCoupons(dto); }
  @Get('deliveries') deliveries(@Query() query: DeliveryQueryDto) { return this.admin.deliveries(query.status); }
  @Post('deliveries/:submissionId/resend') async resend(@Param('submissionId') submissionId: string) { await this.admin.logResend(submissionId); return this.submissions.requestDelivery(submissionId); }
  @Get('history') history() { return this.admin.history(); }
}
