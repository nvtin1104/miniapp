import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './entities/user.entity'; // hoặc ./user.schema nếu Goat để file tên đó
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserSchema } from './user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UploadModule,
    forwardRef(() => AuthModule),
  ],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule { }
