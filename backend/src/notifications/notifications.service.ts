import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { FollowUpStatus, NotificationSource, ReminderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService implements OnModuleInit, OnModuleDestroy {
  private timer?: ReturnType<typeof setInterval>;
  constructor(private prisma: PrismaService) {}
  onModuleInit() {
    void this.synchronize();
    this.timer = setInterval(() => void this.synchronize(), 5_000);
  }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async findAll() {
    await this.synchronize();
    return this.prisma.notification.findMany({
      where: { dueAt: { lte: new Date() } },
      orderBy: [{ readAt: 'asc' }, { dueAt: 'asc' }],
    });
  }
  private async synchronize() {
    const now = new Date();
    const [followUps, reminders] = await Promise.all([
      this.prisma.followUp.findMany({ where: { status: FollowUpStatus.PENDING, dueAt: { lte: now } }, include: { lead: true } }),
      this.prisma.reminder.findMany({ where: { status: ReminderStatus.PENDING, dueAt: { lte: now } }, include: { lead: true } }),
    ]);
    const active = [
      ...followUps.map(item => ({ source: NotificationSource.FOLLOW_UP, sourceId: item.id, sourceKey: `FOLLOW_UP:${item.id}`, title: item.title, dueAt: item.dueAt, leadId: item.leadId, leadName: item.lead?.name || null })),
      ...reminders.map(item => ({ source: NotificationSource.REMINDER, sourceId: item.id, sourceKey: `REMINDER:${item.id}`, title: item.title, dueAt: item.dueAt, leadId: item.leadId, leadName: item.lead?.name || null })),
    ];
    await this.prisma.$transaction([
      ...active.map(item => this.prisma.notification.upsert({ where: { sourceKey: item.sourceKey }, create: item, update: { title: item.title, dueAt: item.dueAt, leadId: item.leadId, leadName: item.leadName } })),
      this.prisma.notification.deleteMany({ where: { sourceKey: { notIn: active.map(item => item.sourceKey) } } }),
    ]);
  }
  async markRead(id: string) {
    if (!(await this.prisma.notification.findUnique({ where: { id } }))) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
  markAllRead() { return this.prisma.notification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } }); }
}
