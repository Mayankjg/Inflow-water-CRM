import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './leads/leads.module';
import { FollowUpsModule } from './follow-ups/follow-ups.module';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { JustdialController } from './integrations/justdial.controller';
import { WebsiteEnquiryController } from './integrations/website-enquiry.controller';
import { HealthController } from './health.controller';

@Module({
  imports: [PrismaModule, LeadsModule, FollowUpsModule],
  controllers: [DashboardController, JustdialController, WebsiteEnquiryController, HealthController],
  providers: [DashboardService],
})
export class AppModule {}
