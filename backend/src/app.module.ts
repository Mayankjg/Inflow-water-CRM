import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './leads/leads.module';
import { FollowUpsModule } from './follow-ups/follow-ups.module';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { JustdialController } from './integrations/justdial.controller';
import { WebsiteEnquiryController } from './integrations/website-enquiry.controller';
import { HealthController } from './health.controller';
import { RemindersModule } from './reminders/reminders.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [PrismaModule, AuthModule, LeadsModule, FollowUpsModule, RemindersModule, NotificationsModule],
  controllers: [DashboardController, JustdialController, WebsiteEnquiryController, HealthController],
  providers: [DashboardService, { provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
