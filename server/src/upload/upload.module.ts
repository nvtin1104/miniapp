import { Module } from '@nestjs/common';
import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';
import { Upload } from 'graphql-upload-ts';
import { UploadSchema } from './upload.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Upload.name, schema: UploadSchema }]),
  ],
  providers: [
    UploadResolver,
    UploadService],
  exports: [UploadService],
})
export class UploadModule { }
