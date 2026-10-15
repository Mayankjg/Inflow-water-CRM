import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowUpStatus, NotificationSource, ReminderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    const now = new Date();
    const [followUps, reminders] = await Promise.all([
      this.prisma.followUp.findMany({ where: { status: FollowUpStatus.PENDING, dueAt: { lte: now } } }),
      this.prisma.reminder.findMany({ where: { status: ReminderStatus.PENDING, dueAt: { lte: now } } }),
    ]);
    const active = [
      ...followUps.map(item => ({ source: NotificationSource.FOLLOW_UP, sourceId: item.id, sourceKey: `FOLLOW_UP:${item.id}`, title: item.title, dueAt: item.dueAt })),
      ...reminders.map(item => ({ source: NotificationSource.REMINDER, sourceId: item.id, sourceKey: `REMINDER:${item.id}`, title: item.title, dueAt: item.dueAt })),
    ];
    await this.prisma.$transaction([
      ...active.map(item => this.prisma.notification.upsert({ where: { sourceKey: item.sourceKey }, create: item, update: {} })),
      this.prisma.notification.deleteMany({ where: { sourceKey: { notIn: active.map(item => item.sourceKey) } } }),
    ]);
    return this.prisma.notification.findMany({ orderBy: [{ readAt: 'asc' }, { dueAt: 'asc' }] });
  }
  async markRead(id: string) {
    if (!(await this.prisma.notification.findUnique({ where: { id } }))) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }
  markAllRead() { return this.prisma.notification.updateMany({ where: { readAt: null }, data: { readAt: new Date() } }); }
}
