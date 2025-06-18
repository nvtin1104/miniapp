import { Module } from '@nestjs/common';
import { ZaloService } from './zalo.service';
import { ZaloResolver } from './zalo.resolver';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createJwtConfig } from 'src/auth/jwt.config';

@Module({
  providers: [ZaloService, ZaloResolver],
  imports: [
    UserModule, 
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: createJwtConfig,
      inject: [ConfigService],
    })
  ]
})
export class ZaloModule {}
