import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startNgrok } from './ngrok.config';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://mini.zalo.me',
      'https://h5.zdn.vn',
      'zbrowser://h5.zdn.vn',
      'https://zalo.me/s/2391325252226688472/',
      'https://zalo.me/s/2391325252226688472/?env=DEVELOPMENT&version=zdev-c55b1f0e',
      'https://zalo.me/app/link/zapps/2391325252226688472/?env=TESTING_LOCAL&clientIp=https%3A%2F%2Fshy-fly-87.mini.123c.vn'
    ],
    // origin: '*',
    credentials: true,
  });
  const port = Number(process.env.PORT) || 5555;
  app.use(cookieParser())
  await app.listen(port);
  const url = await startNgrok(port);
  console.log(`Server is running at: ${url}`);
}
bootstrap();
