import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';
import { RemindersService } from './reminders.service';

class ReminderDto {
  @IsString() @MaxLength(160) title!: string;
  @IsDateString() dueAt!: string;
}
class UpdateReminderDto {
  @IsOptional() @IsString() @MaxLength(160) title?: string;
  @IsOptional() @IsDateString() dueAt?: string;
}
@Controller('reminders')
export class RemindersController {
  constructor(private reminders: RemindersService) {}
  @Get() findAll() { return this.reminders.findAll(); }
  @Post() create(@Body() dto: ReminderDto) { return this.reminders.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateReminderDto) { return this.reminders.update(id, dto); }
  @Patch(':id/complete') complete(@Param('id') id: string) { return this.reminders.complete(id); }
}
