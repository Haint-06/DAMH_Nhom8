import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    roomId: string;
    meetingTitle: string;
    organizerName: string;
    startTime: string | Date;
    endTime: string | Date;
    status?: BookingStatus;
  }) {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (!data.roomId || !data.meetingTitle?.trim() || !data.organizerName?.trim()) {
      throw new BadRequestException('Vui lòng nhập đầy đủ thông tin lịch đặt');
    }
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      throw new BadRequestException('Ngày hoặc thời gian không hợp lệ');
    }
    if (endTime <= startTime) {
      throw new BadRequestException('Giờ kết thúc phải lớn hơn giờ bắt đầu');
    }

    const room = await this.prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) throw new NotFoundException('Không tìm thấy phòng');

    const overlap = await this.prisma.booking.findFirst({
      where: {
        roomId: data.roomId,
        status: 'Confirmed',
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    if (overlap) throw new BadRequestException('Phòng đã có lịch trong khoảng thời gian này');

    return this.prisma.booking.create({
      data: {
        roomId: data.roomId,
        meetingTitle: data.meetingTitle.trim(),
        organizerName: data.organizerName.trim(),
        startTime,
        endTime,
        status: data.status ?? 'Confirmed',
      },
    });
  }

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

  async update(id: string, data: any) {
    await this.findOne(id);
    const updateData = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (updateData.startTime && updateData.endTime && updateData.endTime <= updateData.startTime) {
      throw new BadRequestException('Giờ kết thúc phải lớn hơn giờ bắt đầu');
    }
    return this.prisma.booking.update({ where: { id }, data: updateData });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.booking.delete({ where: { id } });
  }

  history(roomId?: string) {
    return this.prisma.booking.findMany({
      where: { roomId, endTime: { lt: new Date() } },
      include: { room: true },
      orderBy: { startTime: 'desc' },
    });
  }

  upcoming(roomId?: string) {
    return this.prisma.booking.findMany({
      where: { roomId, startTime: { gte: new Date() } },
      include: { room: true },
      orderBy: { startTime: 'asc' },
    });
  }
}
