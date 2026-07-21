<<<<<<< HEAD
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
=======
import { Injectable, NotFoundException } from '@nestjs/common';
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
import { PrismaService } from '../prisma.service';
import { RoomStatus } from '@prisma/client';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

<<<<<<< HEAD
  async create(data: { roomName: string; capacity: number; equipment?: string[]; status?: RoomStatus }) {
    this.validateRoom(data);
    const duplicate = await this.prisma.room.findFirst({ where: { roomName: data.roomName.trim() } });
    if (duplicate) throw new ConflictException('Tên phòng đã tồn tại');

    return this.prisma.room.create({
      data: {
        roomName: data.roomName.trim(),
        capacity: data.capacity,
        equipment: data.equipment ?? [],
        status: data.status ?? 'Active',
      },
      include: { bookings: { orderBy: { startTime: 'desc' } } },
    });
  }

  findAll() {
    return this.prisma.room.findMany({
      include: { bookings: { orderBy: { startTime: 'desc' } } },
      orderBy: { roomName: 'asc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { bookings: { orderBy: { startTime: 'desc' } } },
    });
=======
  create(data: { roomName: string; capacity: number; equipment?: string[]; status?: RoomStatus }) {
    return this.prisma.room.create({ data });
  }

  findAll() {
    return this.prisma.room.findMany();
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
    if (!room) throw new NotFoundException('Không tìm thấy phòng');
    return room;
  }

  async update(id: string, data: { roomName?: string; capacity?: number; equipment?: string[]; status?: RoomStatus }) {
    await this.findOne(id);
<<<<<<< HEAD
    this.validateRoom(data, true);

    if (data.roomName) {
      const duplicate = await this.prisma.room.findFirst({
        where: { roomName: data.roomName.trim(), id: { not: id } },
      });
      if (duplicate) throw new ConflictException('Tên phòng đã tồn tại');
      data.roomName = data.roomName.trim();
    }

    return this.prisma.room.update({
      where: { id },
      data,
      include: { bookings: { orderBy: { startTime: 'desc' } } },
    });
=======
    return this.prisma.room.update({ where: { id }, data });
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
  }

  async remove(id: string) {
    await this.findOne(id);
<<<<<<< HEAD
    await this.prisma.booking.deleteMany({ where: { roomId: id } });
    return this.prisma.room.delete({ where: { id } });
  }

  private validateRoom(data: any, partial = false) {
    if (!partial && !data.roomName?.trim()) throw new BadRequestException('Vui lòng nhập tên phòng');
    if (data.capacity !== undefined && (!Number.isInteger(data.capacity) || data.capacity <= 0)) {
      throw new BadRequestException('Số chỗ phải là số nguyên lớn hơn 0');
    }
    if (data.equipment?.some((item: string) => !/^[\p{L}\p{N}\s,.]+$/u.test(item))) {
      throw new BadRequestException('Thiết bị chỉ được chứa chữ, số, dấu phẩy và dấu chấm');
    }
  }

=======
    return this.prisma.room.delete({ where: { id } });
  }

  // Xem thời gian trống của phòng trong 1 ngày (giờ hành chính 8h-18h)
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
  async getAvailability(id: string, date: string) {
    await this.findOne(id);
    const dayStart = new Date(`${date}T00:00:00`);
    const dayEnd = new Date(`${date}T23:59:59`);

    const bookings = await this.prisma.booking.findMany({
<<<<<<< HEAD
      where: { roomId: id, status: 'Confirmed', startTime: { gte: dayStart, lte: dayEnd } },
=======
      where: {
        roomId: id,
        status: 'Confirmed',
        startTime: { gte: dayStart, lte: dayEnd },
      },
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
      orderBy: { startTime: 'asc' },
    });

    const workStart = new Date(`${date}T08:00:00`);
    const workEnd = new Date(`${date}T18:00:00`);
    const freeSlots: { start: Date; end: Date }[] = [];
    let cursor = workStart;

<<<<<<< HEAD
    for (const booking of bookings) {
      if (booking.startTime > cursor) freeSlots.push({ start: cursor, end: booking.startTime });
      if (booking.endTime > cursor) cursor = booking.endTime;
=======
    for (const b of bookings) {
      if (b.startTime > cursor) {
        freeSlots.push({ start: cursor, end: b.startTime });
      }
      if (b.endTime > cursor) cursor = b.endTime;
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
    }
    if (cursor < workEnd) freeSlots.push({ start: cursor, end: workEnd });

    return { bookings, freeSlots };
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
