import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}
  @Get() findAll() { return this.notifications.findAll(); }
  @Patch('read-all') markAllRead() { return this.notifications.markAllRead(); }
  @Patch(':id/read') markRead(@Param('id') id: string) { return this.notifications.markRead(id); }
}
