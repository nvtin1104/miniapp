import { Injectable } from '@nestjs/common';
import { FileUpload } from 'graphql-upload-ts';
import { createWriteStream } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  async uploadFile(file: FileUpload): Promise<string> {
    const { createReadStream, filename } = await file;

    const uploadPath = join(__dirname, '..', '..', 'uploads', filename);

    return new Promise((resolve, reject) => {
      createReadStream()
        .pipe(createWriteStream(uploadPath))
        .on('finish', () => resolve(`File uploaded: ${filename}`))
        .on('error', (error) => reject(`Upload failed: ${error}`));
    });
  }
}
