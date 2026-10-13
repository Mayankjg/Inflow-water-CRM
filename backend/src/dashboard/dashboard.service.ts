import { Injectable } from '@nestjs/common';
import { LeadStatus, FollowUpStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}
  async summary() {
    const [totalLeads, newLeads, convertedLeads, pendingFollowUps, recentLeads] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: LeadStatus.NEW } }),
      this.prisma.lead.count({ where: { status: LeadStatus.CONVERTED } }),
      this.prisma.followUp.count({ where: { status: FollowUpStatus.PENDING } }),
      this.prisma.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
    ]);
    return { totalLeads, newLeads, convertedLeads, pendingFollowUps, recentLeads };
  }
}
