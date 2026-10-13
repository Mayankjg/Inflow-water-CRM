import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}
  @Get() findAll() { return this.leads.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.leads.findOne(id); }
  @Post() create(@Body() dto: CreateLeadDto) { return this.leads.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateLeadDto) { return this.leads.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.leads.remove(id); }
}
