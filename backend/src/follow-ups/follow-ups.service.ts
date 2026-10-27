import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowUpStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowUpDto, CompleteFollowUpDto } from './dto/create-follow-up.dto';
@Injectable()
export class FollowUpsService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.followUp.findMany({ orderBy: { dueAt: 'asc' }, include: { lead: true } }); }
  async create(dto: CreateFollowUpDto) {
    const task = await this.prisma.followUp.create({ data: { ...dto, dueAt: new Date(dto.dueAt) }, include: { lead: true } });
    if (task.leadId) await this.prisma.leadActivity.create({ data: { leadId: task.leadId, type: 'FOLLOW_UP', title: `Follow-up scheduled: ${task.title}`, details: task.notes } });
    return task;
  }
  async complete(id: string, dto: CompleteFollowUpDto = {}) {
    const task = await this.prisma.followUp.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Follow-up not found');
    const result = await this.prisma.followUp.update({ where: { id }, data: { status: FollowUpStatus.COMPLETED, result: dto.result } });
    if (task.leadId) await this.prisma.leadActivity.create({ data: { leadId: task.leadId, type: 'FOLLOW_UP', title: `Follow-up completed: ${task.title}`, details: dto.result || task.notes } });
    if (dto.nextTitle && dto.nextDueAt) await this.create({ title: dto.nextTitle, dueAt: dto.nextDueAt, leadId: task.leadId || undefined });
    await this.prisma.notification.deleteMany({ where: { sourceKey: `FOLLOW_UP:${id}` } });
    return result;
  }
  async update(id: string, dto: Omit<Partial<CreateFollowUpDto>, 'leadId'> & { leadId?: string | null }) {
    const task = await this.prisma.followUp.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Follow-up not found');
    const result = await this.prisma.followUp.update({ where: { id }, data: { ...dto, ...(dto.dueAt ? { dueAt: new Date(dto.dueAt) } : {}) } });
    await this.prisma.notification.deleteMany({ where: { sourceKey: `FOLLOW_UP:${id}` } });
    return result;
  }
}
