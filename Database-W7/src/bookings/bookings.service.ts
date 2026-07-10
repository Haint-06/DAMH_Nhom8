import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  findAll(roomId?: string) {
    return this.prisma.booking.findMany({
      where: roomId ? { roomId } : undefined,
      include: { room: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id }, include: { room: true } });
    if (!booking) throw new NotFoundException('Không tìm thấy lịch đặt');
    return booking;
  }

  async history(roomId?: string) {
    return this.prisma.booking.findMany({
      where: { roomId, endTime: { lt: new Date() } },
      include: { room: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async upcoming(roomId?: string) {
    return this.prisma.booking.findMany({
      where: { roomId, startTime: { gte: new Date() } },
      include: { room: true },
      orderBy: { startTime: 'asc' },
    });
  }
}