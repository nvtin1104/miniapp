import { Injectable } from '@nestjs/common';
import { FileUpload } from 'graphql-upload-ts';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { UploadFileInput } from './upload.input';
import { UploadFileInfo } from './upload.output';
import { Model } from 'mongoose';
import { Upload, UploadDocument } from './upload.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  constructor(
    @InjectModel(Upload.name) private uploadModel: Model<UploadDocument>
  ) { }
  async uploadFile(file: FileUpload, uploadFileInfo: UploadFileInput): Promise<UploadFileInfo> {
    const { createReadStream, filename } = await file;
    const { mimetype } = await file;
    const { table, filename: filenameInput, type } = uploadFileInfo;
    if (!table) throw new Error('Bảng lưu trữ là bắt buộc');
    if (!filenameInput) throw new Error('Tên file là bắt buộc');
    if (!type) throw new Error('Loại file là bắt buộc');
    if (type === 'images') {
      console.log('mime', mimetype);
      if (mimetype.startsWith('image/') || mimetype === 'application/octet-stream') {
        const chunks: Buffer[] = [];
        for await (const chunk of createReadStream()) {
          chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);
        const image = await sharp(buffer).resize(100, 100).toBuffer();
      }
      else {
        throw new Error('Hình ảnh không hợp lệ');
      }
    }
    else {
      throw new Error('Hệ thống không hỗ trợ loại file này');
    }

    const newFilename = `${Date.now()}-${filename}`;
    const uploadDir = join(__dirname, '..', '..', 'uploads', type, table);
    const uploadPath = join(uploadDir, newFilename);

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    await new Promise((resolve, reject) => {
      createReadStream()
        .pipe(createWriteStream(uploadPath))
        .on('finish', () => resolve({
          ...uploadFileInfo,
          path: uploadPath,
        }))
        .on('error', (error) => reject(`Tải lên thất bại: ${error}`));
    });

    const upload = new this.uploadModel({
      ...uploadFileInfo,
      filename: newFilename,
      path: uploadPath,
    });
    const result = await upload.save();

    return result as UploadFileInfo;
  }
  createUpload(uploadFileInfo: UploadFileInput) {
    const upload = new this.uploadModel(uploadFileInfo);
    return upload.save();
  }
}
