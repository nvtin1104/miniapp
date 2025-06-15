import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { UploadService } from './upload.service';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) {}

  @Mutation(() => String)
  async uploadFile(@Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload) {
    return this.uploadService.uploadFile(file);
  }
}
