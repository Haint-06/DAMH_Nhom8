import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

<<<<<<< HEAD
  const port = Number(process.env.PORT) || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`Server đang chạy tại cổng ${port}`);
=======
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
>>>>>>> 6ea0951e8139a36fb1c3fe6265004efa425a3020
}

bootstrap();