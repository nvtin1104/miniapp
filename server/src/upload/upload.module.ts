import { Module } from '@nestjs/common';
import { UploadResolver } from './upload.resolver';
import { UploadService } from './upload.service';

@Module({
  providers: [UploadResolver, UploadService],
  exports: [UploadService], // Export để module khác dùng
})
export class UploadModule {}
