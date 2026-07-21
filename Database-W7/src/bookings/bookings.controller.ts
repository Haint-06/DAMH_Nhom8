<<<<<<< HEAD
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
=======
import { Controller, Get, Param, Query } from '@nestjs/common';
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

<<<<<<< HEAD
  @Post()
  create(@Body() body: any) {
    return this.bookingsService.create(body);
  }

=======
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
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
<<<<<<< HEAD

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bookingsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
=======
}
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
