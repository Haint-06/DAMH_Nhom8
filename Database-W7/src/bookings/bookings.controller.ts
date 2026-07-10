import { Controller, Get, Param, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(@Query('roomId') roomId?: string) {
    return this.bookingsService.findAll(roomId);
  }

  @Get('history')
  history(@Query('roomId') roomId?: string) {
    return this.bookingsService.history(roomId);
  }

  @Get('upcoming')
  upcoming(@Query('roomId') roomId?: string) {
    return this.bookingsService.upcoming(roomId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }
}