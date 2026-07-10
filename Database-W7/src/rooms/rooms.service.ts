import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  create(data: { roomName: string; capacity: number; equipment?: string[]; status?: RoomStatus }) {
    return this.prisma.room.create({ data });
  }

  findAll() {
    return this.prisma.room.findMany();
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async update(id: string, data: { roomName?: string; capacity?: number; equipment?: string[]; status?: RoomStatus }) {
    await this.findOne(id);
    return this.prisma.room.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.room.delete({ where: { id } });
  }

  // Xem thời gian trống của phòng trong 1 ngày (giờ hành chính 8h-18h)
  async getAvailability(id: string, date: string) {
    await this.findOne(id);
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const bookings = await this.prisma.booking.findMany({
      where: {
        roomId: id,
        status: 'Confirmed',
        startTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { startTime: 'asc' },
    });

    const workStart = new Date(`${date}T08:00:00`);
    const workEnd = new Date(`${date}T18:00:00`);
    const freeSlots: { start: Date; end: Date }[] = [];
    let cursor = workStart;

    for (const b of bookings) {
      if (b.startTime > cursor) {
        freeSlots.push({ start: cursor, end: b.startTime });
      }
      if (b.endTime > cursor) cursor = b.endTime;
    }
    if (cursor < workEnd) freeSlots.push({ start: cursor, end: workEnd });

    return { bookings, freeSlots };
  }
}