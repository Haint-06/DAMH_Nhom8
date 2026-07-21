import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() body: any) {
    return this.bookingsService.create(body);
  }

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bookingsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
