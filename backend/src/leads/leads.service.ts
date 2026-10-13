import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}
  findAll() { return this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, include: { followUps: true } }); }
  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id }, include: { followUps: true } });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }
  create(dto: CreateLeadDto) { return this.prisma.lead.create({ data: dto }); }
  async update(id: string, dto: UpdateLeadDto) {
    await this.findOne(id);
    return this.prisma.lead.update({ where: { id }, data: dto });
  }
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.lead.delete({ where: { id } });
  }
}
