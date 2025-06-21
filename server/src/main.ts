import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { startNgrok } from './ngrok.config';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://h5.zdn.vn',
      'zbrowser://h5.zdn.vn',
      'http://localhost:5173',
      'https://miniapp-wheat.vercel.app'
    ],
    credentials: true,
  });
  const port = Number(process.env.PORT) || 5555;
  app.use(cookieParser())
  await app.listen(port);
  const url = await startNgrok(port);
  console.log(`Server is running at: ${url}`);
}
bootstrap();
