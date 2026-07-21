import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

=======
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
<<<<<<< HEAD

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/rooms*', '/bookings*'],
    }),

    RoomsModule,
    BookingsModule,
=======
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


@Module({
  imports: [
    RoomsModule,
    BookingsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
  ],
  controllers: [AppController],
  providers: [AppService],
})
<<<<<<< HEAD
export class AppModule {}
=======
export class AppModule {}
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
