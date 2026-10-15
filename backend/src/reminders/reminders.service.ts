import { Injectable, NotFoundException } from '@nestjs/common';
import { ReminderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ReminderInput = { title: string; dueAt: string };
@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.reminder.findMany({ orderBy: { dueAt: 'asc' } }); }
  create(dto: ReminderInput) { return this.prisma.reminder.create({ data: { title: dto.title, dueAt: new Date(dto.dueAt) } }); }
  async update(id: string, dto: Partial<ReminderInput>) {
    if (!(await this.prisma.reminder.findUnique({ where: { id } }))) throw new NotFoundException('Reminder not found');
    const result = await this.prisma.reminder.update({ where: { id }, data: { ...dto, ...(dto.dueAt ? { dueAt: new Date(dto.dueAt) } : {}) } });
    await this.prisma.notification.deleteMany({ where: { sourceKey: `REMINDER:${id}` } });
    return result;
  }
  async complete(id: string) {
    if (!(await this.prisma.reminder.findUnique({ where: { id } }))) throw new NotFoundException('Reminder not found');
    const result = await this.prisma.reminder.update({ where: { id }, data: { status: ReminderStatus.COMPLETED } });
    await this.prisma.notification.deleteMany({ where: { sourceKey: `REMINDER:${id}` } });
    return result;
  }
}
