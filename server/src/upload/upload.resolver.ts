import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { UploadService } from './upload.service';
import { UploadFileInput } from './upload.input';
import { UploadFileInfo } from './upload.output';

@Resolver()
export class UploadResolver {
  constructor(private readonly uploadService: UploadService) { }

  @Mutation(() => UploadFileInfo)
  async uploadFile(@Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload, @Args('uploadFileInput') uploadFileInput: UploadFileInput) {
    const result = this.uploadService.uploadFile(file, uploadFileInput);
    return result;
  }
}
