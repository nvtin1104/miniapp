import { Injectable } from '@nestjs/common';
import { FileUpload } from 'graphql-upload-ts';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { UploadFileInput } from './upload.input';
import { UploadFileInfo } from './upload.output';
import { Model } from 'mongoose';
import { Upload, UploadDocument } from './upload.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(Upload.name) private uploadModel: Model<UploadDocument>
  ) { }
  async uploadFile(file: FileUpload, uploadFileInfo: UploadFileInput): Promise<UploadFileInfo> {
    const { createReadStream, filename } = await file;
    const { table, filename: filenameInput, type } = uploadFileInfo;

    if (!table) throw new Error('Table is required');
    if (!filenameInput) throw new Error('Filename is required');
    if (!type) throw new Error('Type is required');

    const newFilename = `${Date.now()}-${filename}`;
    const uploadDir = join(__dirname, '..', '..', 'uploads', type, table);
    const uploadPath = join(uploadDir, newFilename);

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const result = await new Promise((resolve, reject) => {
      createReadStream()
        .pipe(createWriteStream(uploadPath))
        .on('finish', () => resolve({
          ...uploadFileInfo,
          path: uploadPath,
        }))
        .on('error', (error) => reject(`Upload failed: ${error}`));
    });

    const upload = new this.uploadModel({
      ...uploadFileInfo,
      filename: newFilename,
      path: uploadPath,
    });
    await upload.save();
    
    return result as UploadFileInfo;
  }
}
