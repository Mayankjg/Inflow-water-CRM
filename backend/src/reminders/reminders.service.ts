import { Injectable, NotFoundException } from '@nestjs/common';
import { ReminderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ReminderInput = { title: string; dueAt: string; description?: string; leadId?: string | null };
@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.reminder.findMany({ orderBy: { dueAt: 'asc' }, include: { lead: true } }); }
  async create(dto: ReminderInput) {
    const task = await this.prisma.reminder.create({ data: { ...dto, dueAt: new Date(dto.dueAt) }, include: { lead: true } });
    if (task.leadId) await this.prisma.leadActivity.create({ data: { leadId: task.leadId, type: 'REMINDER', title: `Reminder scheduled: ${task.title}`, details: task.description } });
    return task;
  }
  async update(id: string, dto: Partial<ReminderInput>) {
    if (!(await this.prisma.reminder.findUnique({ where: { id } }))) throw new NotFoundException('Reminder not found');
    const result = await this.prisma.reminder.update({ where: { id }, data: { ...dto, ...(dto.dueAt ? { dueAt: new Date(dto.dueAt) } : {}) } });
    await this.prisma.notification.deleteMany({ where: { sourceKey: `REMINDER:${id}` } });
    return result;
  }
  async complete(id: string) {
    if (!(await this.prisma.reminder.findUnique({ where: { id } }))) throw new NotFoundException('Reminder not found');
    const result = await this.prisma.reminder.update({ where: { id }, data: { status: ReminderStatus.COMPLETED } });
    const task = await this.prisma.reminder.findUnique({ where: { id } });
    if (task?.leadId) await this.prisma.leadActivity.create({ data: { leadId: task.leadId, type: 'REMINDER', title: `Reminder completed: ${task.title}`, details: task.description } });
    await this.prisma.notification.deleteMany({ where: { sourceKey: `REMINDER:${id}` } });
    return result;
  }
}
