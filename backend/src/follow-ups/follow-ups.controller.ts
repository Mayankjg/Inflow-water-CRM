import { Body, Controller, Get, Patch, Param, Post } from '@nestjs/common';
import { FollowUpsService } from './follow-ups.service';
import { CreateFollowUpDto, UpdateFollowUpDto, CompleteFollowUpDto } from './dto/create-follow-up.dto';
@Controller('follow-ups')
export class FollowUpsController {
  constructor(private readonly followUps: FollowUpsService) {}
  @Get() findAll() { return this.followUps.findAll(); }
  @Post() create(@Body() dto: CreateFollowUpDto) { return this.followUps.create(dto); }
  @Patch(':id/complete') complete(@Param('id') id: string, @Body() dto: CompleteFollowUpDto) { return this.followUps.complete(id, dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateFollowUpDto) { return this.followUps.update(id, dto); }
}
