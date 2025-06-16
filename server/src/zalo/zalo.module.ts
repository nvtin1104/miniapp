import { Module } from '@nestjs/common';
import { ZaloService } from './zalo.service';
import { ZaloResolver } from './zalo.resolver';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [ZaloService, ZaloResolver],
  imports: [UserModule]
})
export class ZaloModule {}
