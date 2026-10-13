import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowUpStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
@Injectable()
export class FollowUpsService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.followUp.findMany({ orderBy: { dueAt: 'asc' }, include: { lead: true } }); }
  create(dto: CreateFollowUpDto) { return this.prisma.followUp.create({ data: { ...dto, dueAt: new Date(dto.dueAt) } }); }
  async complete(id: string) {
    const task = await this.prisma.followUp.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Follow-up not found');
    return this.prisma.followUp.update({ where: { id }, data: { status: FollowUpStatus.COMPLETED } });
  }
}
